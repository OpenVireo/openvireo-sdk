# Line-delimited JSON bridge to the libopaque C core through its Python binding (the same code path as
# the Flask auth server). Used by test/opaque-interop.test.ts. Besides the server steps it offers a
# C-side *client*, so a user registered from WASM can be checked against a C client and vice versa.
#   python3 -I opaque_server.py <path to libopaque/python>   (env LIBOPAQUE=<libopaque.dylib|so>, optional LIBSODIUM)
import json, os, sys, ctypes.util

sys.path.insert(0, sys.argv[1])
_find = ctypes.util.find_library
_over = {"opaque": os.environ.get("LIBOPAQUE"), "sodium": os.environ.get("LIBSODIUM")}
ctypes.util.find_library = lambda n: _over.get(n) or _find(n)
import opaque  # noqa: E402

state = {}
h = bytes.fromhex
for line in sys.stdin:
    m = json.loads(line)
    op = m["op"]
    try:
        ids = opaque.Ids(m["idU"], m["idS"]) if "idU" in m else None
        ctx = m.get("context", "ov-opaque-v1").encode()
        if op == "reg":  # server: CreateRegistrationResponse with a per-user keypair (skS = None)
            sec, pub = opaque.CreateRegistrationResponse(h(m["M"]))
            state["regsec"] = sec
            out = {"pub": pub.hex()}
        elif op == "store":
            state["rec"] = opaque.StoreUserRecord(state["regsec"], h(m["rec"]))
            out = {}
        elif op == "login":
            resp, sk, sec = opaque.CreateCredentialResponse(h(m["pub"]), state["rec"], ids, ctx)
            state["authU0"] = sec
            out = {"resp": resp.hex(), "sk": sk.hex()}
        elif op == "auth":
            try:
                opaque.UserAuth(state["authU0"], h(m["authU"]))
                out = {"ok": True}
            except Exception as e:  # noqa: BLE001
                out = {"ok": False, "err": str(e)}
        elif op == "c_register":  # C client + C server, password as UTF-8 bytes
            pw = bytes.fromhex(m["pw"])
            csec, M = opaque.CreateRegistrationRequest(pw)
            ssec, pub = opaque.CreateRegistrationResponse(M)
            rec, _ = opaque.FinalizeRequest(csec, pub, ids)
            state["rec"] = opaque.StoreUserRecord(ssec, rec)
            out = {}
        elif op == "c_login":  # C client against the stored record
            pw = bytes.fromhex(m["pw"])
            pub, csec = opaque.CreateCredentialRequest(pw)  # note: (pub, sec) order
            resp, sk, ssec = opaque.CreateCredentialResponse(pub, state["rec"], ids, ctx)
            try:
                sk2, authU, _ = opaque.RecoverCredentials(resp, csec, ctx, ids)
                opaque.UserAuth(ssec, authU)
                out = {"ok": sk2 == sk}
            except Exception as e:  # noqa: BLE001
                out = {"ok": False, "err": str(e)}
        else:
            out = {"error": "unknown op " + op}
    except Exception as e:  # noqa: BLE001
        out = {"error": str(e)}
    print(json.dumps(out), flush=True)
