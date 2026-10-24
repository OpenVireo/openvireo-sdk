//! OPAQUE (SPEC §8, RFC 9807) for @openvireo/sdk, over opaque-ke, as a WASM module with no imports.
//!
//! Suite: ristretto255 OPRF and 3DH, SHA-512, KSF = Argon2id v1.3 (64 MiB, 2 passes, 1 lane, all-zero
//! salt). That is libsodium's `crypto_pwhash` INTERACTIVE setting, which libopaque uses, so this module
//! talks to the libopaque server (Flask) and shares records with the libopaque C client (Qt).
//!
//! ABI: `ov_alloc`/`ov_free` for the input buffer, then `ov_call(op, ptr, len) -> status`. Input and
//! output are lists of fields, each `u32 LE length ‖ bytes`. The output stays in a module buffer
//! (`ov_out_ptr`/`ov_out_len`) until `ov_out_clear`, which zeroes it. Every call that needs randomness
//! takes a 32-byte seed from the caller (crypto.getRandomValues) for a ChaCha20 RNG, so the module needs
//! no host imports. Status: 0 ok, 1 authentication failed, 2 bad input.

use argon2::{Algorithm, Argon2, Params, Version};
use opaque_ke::{
    CipherSuite, ClientLogin, ClientLoginFinishParameters, ClientRegistration, ClientRegistrationFinishParameters,
    CredentialFinalization, CredentialRequest, CredentialResponse, Identifiers, RegistrationRequest,
    RegistrationResponse, RegistrationUpload, Ristretto255, ServerLogin, ServerLoginParameters, ServerRegistration,
    ServerSetup, TripleDh,
};
use rand_chacha::ChaCha20Rng;
use rand_core::SeedableRng;
use std::cell::RefCell;
use zeroize::{Zeroize, Zeroizing};

struct Suite;
impl CipherSuite for Suite {
    type OprfCs = Ristretto255;
    type KeyExchange = TripleDh<Ristretto255, sha2::Sha512>;
    type Ksf = Argon2<'static>;
}

fn ksf() -> Argon2<'static> {
    // crypto_pwhash_MEMLIMIT_INTERACTIVE (64 MiB) and crypto_pwhash_OPSLIMIT_INTERACTIVE (2)
    Argon2::new(Algorithm::Argon2id, Version::V0x13, Params::new(65536, 2, 1, None).unwrap())
}

const OK: i32 = 0;
const AUTH_FAILED: i32 = 1;
const BAD_INPUT: i32 = 2;

/// The test server derives each user's OPRF key from its own ServerSetup, so the id is a constant.
const CREDENTIAL_ID: &[u8] = b"ov";

thread_local! {
    static OUT: RefCell<Vec<u8>> = const { RefCell::new(Vec::new()) };
}

#[no_mangle]
pub extern "C" fn ov_alloc(len: usize) -> *mut u8 {
    let mut v = Vec::<u8>::with_capacity(len.max(1));
    let p = v.as_mut_ptr();
    std::mem::forget(v);
    p
}

/// # Safety
/// `ptr` and `len` must come from `ov_alloc`.
#[no_mangle]
pub unsafe extern "C" fn ov_free(ptr: *mut u8, len: usize) {
    let mut v = Vec::from_raw_parts(ptr, len.max(1), len.max(1));
    v.zeroize();
}

#[no_mangle]
pub extern "C" fn ov_out_ptr() -> *const u8 {
    OUT.with(|o| o.borrow().as_ptr())
}

#[no_mangle]
pub extern "C" fn ov_out_len() -> usize {
    OUT.with(|o| o.borrow().len())
}

#[no_mangle]
pub extern "C" fn ov_out_clear() {
    OUT.with(|o| {
        let mut o = o.borrow_mut();
        o.zeroize();
        *o = Vec::new();
    });
}

enum Fail {
    Auth,
    Input,
}

type Fields<'a> = Vec<&'a [u8]>;

fn unpack(mut b: &[u8], n: usize) -> Result<Fields<'_>, Fail> {
    let mut out = Vec::with_capacity(n);
    for _ in 0..n {
        if b.len() < 4 {
            return Err(Fail::Input);
        }
        let len = u32::from_le_bytes([b[0], b[1], b[2], b[3]]) as usize;
        if b.len() - 4 < len {
            return Err(Fail::Input);
        }
        out.push(&b[4..4 + len]);
        b = &b[4 + len..];
    }
    if !b.is_empty() {
        return Err(Fail::Input);
    }
    Ok(out)
}

fn pack(fields: &[&[u8]]) -> Zeroizing<Vec<u8>> {
    let mut v = Zeroizing::new(Vec::with_capacity(fields.iter().map(|f| 4 + f.len()).sum()));
    for f in fields {
        v.extend_from_slice(&(f.len() as u32).to_le_bytes());
        v.extend_from_slice(f);
    }
    v
}

fn rng(seed: &[u8]) -> Result<ChaCha20Rng, Fail> {
    let seed: [u8; 32] = seed.try_into().map_err(|_| Fail::Input)?;
    Ok(ChaCha20Rng::from_seed(seed))
}

fn ids<'a>(id_u: &'a [u8], id_s: &'a [u8]) -> Identifiers<'a> {
    Identifiers { client: Some(id_u), server: Some(id_s) }
}

fn input<T, E>(r: Result<T, E>) -> Result<T, Fail> {
    r.map_err(|_| Fail::Input)
}

/// Client state between the two steps: the opaque-ke state and the password (finish needs it again).
fn client_state(state: &[u8], pw: &[u8]) -> Zeroizing<Vec<u8>> {
    pack(&[state, pw])
}

fn run(op: u32, inp: &[u8]) -> Result<Zeroizing<Vec<u8>>, Fail> {
    match op {
        // client: [seed, pw] -> [request, state]
        1 => {
            let f = unpack(inp, 2)?;
            let r = input(ClientRegistration::<Suite>::start(&mut rng(f[0])?, f[1]))?;
            Ok(pack(&[&r.message.serialize(), &client_state(&r.state.serialize(), f[1])]))
        }
        // client: [seed, state, response, idU, idS] -> [record, export_key]
        2 => {
            let f = unpack(inp, 5)?;
            let s = unpack(f[1], 2)?;
            let state = input(ClientRegistration::<Suite>::deserialize(s[0]))?;
            let k = ksf();
            let r = input(state.finish(
                &mut rng(f[0])?,
                s[1],
                input(RegistrationResponse::deserialize(f[2]))?,
                ClientRegistrationFinishParameters::new(ids(f[3], f[4]), Some(&k)),
            ))?;
            Ok(pack(&[&r.message.serialize(), &r.export_key]))
        }
        // client: [seed, pw] -> [ke1, state]
        3 => {
            let f = unpack(inp, 2)?;
            let r = input(ClientLogin::<Suite>::start(&mut rng(f[0])?, f[1]))?;
            Ok(pack(&[&r.message.serialize(), &client_state(&r.state.serialize(), f[1])]))
        }
        // client: [seed, state, ke2, context, idU, idS] -> [auth_u, session_key, export_key]
        4 => {
            let f = unpack(inp, 6)?;
            let s = unpack(f[1], 2)?;
            let state = input(ClientLogin::<Suite>::deserialize(s[0]))?;
            let k = ksf();
            let r = state
                .finish(
                    &mut rng(f[0])?,
                    s[1],
                    input(CredentialResponse::deserialize(f[2]))?,
                    ClientLoginFinishParameters::new(Some(f[3]), ids(f[4], f[5]), Some(&k)),
                )
                .map_err(|_| Fail::Auth)?;
            Ok(pack(&[&r.message.serialize(), &r.session_key, &r.export_key]))
        }
        // test server: [seed, request] -> [sec, response]; a new ServerSetup per user, like libopaque's
        // per-user server keypair
        10 => {
            let f = unpack(inp, 2)?;
            let setup = ServerSetup::<Suite>::new(&mut rng(f[0])?);
            let r = input(ServerRegistration::start(&setup, input(RegistrationRequest::deserialize(f[1]))?, CREDENTIAL_ID))?;
            Ok(pack(&[&setup.serialize(), &r.message.serialize()]))
        }
        // test server: [sec, record] -> [stored record]
        11 => {
            let f = unpack(inp, 2)?;
            input(ServerSetup::<Suite>::deserialize(f[0]))?;
            let file = ServerRegistration::finish(input(RegistrationUpload::<Suite>::deserialize(f[1]))?);
            Ok(pack(&[&pack(&[f[0], &file.serialize()])]))
        }
        // test server: [seed, ke1, stored record, context, idU, idS] -> [ke2, sec]
        12 => {
            let f = unpack(inp, 6)?;
            let rec = unpack(f[2], 2)?;
            let setup = input(ServerSetup::<Suite>::deserialize(rec[0]))?;
            let file = input(ServerRegistration::<Suite>::deserialize(rec[1]))?;
            let r = input(ServerLogin::start(
                &mut rng(f[0])?,
                &setup,
                Some(file),
                input(CredentialRequest::deserialize(f[1]))?,
                CREDENTIAL_ID,
                ServerLoginParameters { context: Some(f[3]), identifiers: ids(f[4], f[5]) },
            ))?;
            let sec = pack(&[&r.state.serialize(), f[3], f[4], f[5]]);
            Ok(pack(&[&r.message.serialize(), &sec]))
        }
        // test server: [sec, auth_u] -> [session_key]
        13 => {
            let f = unpack(inp, 2)?;
            let s = unpack(f[0], 4)?;
            let state = input(ServerLogin::<Suite>::deserialize(s[0]))?;
            let fin = CredentialFinalization::<Suite>::deserialize(f[1]).map_err(|_| Fail::Auth)?;
            let r = state
                .finish(fin, ServerLoginParameters { context: Some(s[1]), identifiers: ids(s[2], s[3]) })
                .map_err(|_| Fail::Auth)?;
            Ok(pack(&[&r.session_key]))
        }
        _ => Err(Fail::Input),
    }
}

/// # Safety
/// `ptr` and `len` must describe memory from `ov_alloc`.
#[no_mangle]
pub unsafe extern "C" fn ov_call(op: u32, ptr: *const u8, len: usize) -> i32 {
    ov_out_clear();
    let inp = std::slice::from_raw_parts(ptr, len);
    match run(op, inp) {
        Ok(mut out) => {
            OUT.with(|o| *o.borrow_mut() = std::mem::take(&mut *out));
            OK
        }
        Err(Fail::Auth) => AUTH_FAILED,
        Err(Fail::Input) => BAD_INPUT,
    }
}
