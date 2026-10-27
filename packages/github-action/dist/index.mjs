import { createRequire as __ovCreateRequire } from "node:module"; const require = __ovCreateRequire(import.meta.url);
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod2) => function __require2() {
  return mod2 || (0, cb[__getOwnPropNames(cb)[0]])((mod2 = { exports: {} }).exports, mod2), mod2.exports;
};
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod2, isNodeMode, target) => (target = mod2 != null ? __create(__getProtoOf(mod2)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod2 || !mod2.__esModule ? __defProp(target, "default", { value: mod2, enumerable: true }) : target,
  mod2
));

// ../../node_modules/hash-wasm/dist/index.esm.js
var index_esm_exports = {};
__export(index_esm_exports, {
  adler32: () => adler32,
  argon2Verify: () => argon2Verify,
  argon2d: () => argon2d,
  argon2i: () => argon2i,
  argon2id: () => argon2id,
  bcrypt: () => bcrypt,
  bcryptVerify: () => bcryptVerify,
  blake2b: () => blake2b,
  blake2s: () => blake2s,
  blake3: () => blake3,
  crc32: () => crc32,
  crc64: () => crc64,
  createAdler32: () => createAdler32,
  createBLAKE2b: () => createBLAKE2b,
  createBLAKE2s: () => createBLAKE2s,
  createBLAKE3: () => createBLAKE3,
  createCRC32: () => createCRC32,
  createCRC64: () => createCRC64,
  createHMAC: () => createHMAC,
  createKeccak: () => createKeccak,
  createMD4: () => createMD4,
  createMD5: () => createMD5,
  createRIPEMD160: () => createRIPEMD160,
  createSHA1: () => createSHA1,
  createSHA224: () => createSHA224,
  createSHA256: () => createSHA256,
  createSHA3: () => createSHA3,
  createSHA384: () => createSHA384,
  createSHA512: () => createSHA512,
  createSM3: () => createSM3,
  createWhirlpool: () => createWhirlpool,
  createXXHash128: () => createXXHash128,
  createXXHash3: () => createXXHash3,
  createXXHash32: () => createXXHash32,
  createXXHash64: () => createXXHash64,
  keccak: () => keccak,
  md4: () => md4,
  md5: () => md5,
  pbkdf2: () => pbkdf2,
  ripemd160: () => ripemd160,
  scrypt: () => scrypt,
  sha1: () => sha1,
  sha224: () => sha224,
  sha256: () => sha256,
  sha3: () => sha3,
  sha384: () => sha384,
  sha512: () => sha512,
  sm3: () => sm3,
  whirlpool: () => whirlpool,
  xxhash128: () => xxhash128,
  xxhash3: () => xxhash3,
  xxhash32: () => xxhash32,
  xxhash64: () => xxhash64
});
function __awaiter(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
}
function getGlobal() {
  if (typeof globalThis !== "undefined")
    return globalThis;
  if (typeof self !== "undefined")
    return self;
  if (typeof window !== "undefined")
    return window;
  return global;
}
function intArrayToString(arr, len) {
  return String.fromCharCode(...arr.subarray(0, len));
}
function hexCharCodesToInt(a, b) {
  return (a & 15) + (a >> 6 | a >> 3 & 8) << 4 | (b & 15) + (b >> 6 | b >> 3 & 8);
}
function writeHexToUInt8(buf, str) {
  const size = str.length >> 1;
  for (let i = 0; i < size; i++) {
    const index = i << 1;
    buf[i] = hexCharCodesToInt(str.charCodeAt(index), str.charCodeAt(index + 1));
  }
}
function hexStringEqualsUInt8(str, buf) {
  if (str.length !== buf.length * 2) {
    return false;
  }
  for (let i = 0; i < buf.length; i++) {
    const strIndex = i << 1;
    if (buf[i] !== hexCharCodesToInt(str.charCodeAt(strIndex), str.charCodeAt(strIndex + 1))) {
      return false;
    }
  }
  return true;
}
function getDigestHex(tmpBuffer, input, hashLength) {
  let p = 0;
  for (let i = 0; i < hashLength; i++) {
    let nibble = input[i] >>> 4;
    tmpBuffer[p++] = nibble > 9 ? nibble + alpha : nibble + digit;
    nibble = input[i] & 15;
    tmpBuffer[p++] = nibble > 9 ? nibble + alpha : nibble + digit;
  }
  return String.fromCharCode.apply(null, tmpBuffer);
}
function encodeBase64(data2, pad = true) {
  const len = data2.length;
  const extraBytes = len % 3;
  const parts = [];
  const len2 = len - extraBytes;
  for (let i = 0; i < len2; i += 3) {
    const tmp = (data2[i] << 16 & 16711680) + (data2[i + 1] << 8 & 65280) + (data2[i + 2] & 255);
    const triplet = base64Chars.charAt(tmp >> 18 & 63) + base64Chars.charAt(tmp >> 12 & 63) + base64Chars.charAt(tmp >> 6 & 63) + base64Chars.charAt(tmp & 63);
    parts.push(triplet);
  }
  if (extraBytes === 1) {
    const tmp = data2[len - 1];
    const a = base64Chars.charAt(tmp >> 2);
    const b = base64Chars.charAt(tmp << 4 & 63);
    parts.push(`${a}${b}`);
    if (pad) {
      parts.push("==");
    }
  } else if (extraBytes === 2) {
    const tmp = (data2[len - 2] << 8) + data2[len - 1];
    const a = base64Chars.charAt(tmp >> 10);
    const b = base64Chars.charAt(tmp >> 4 & 63);
    const c = base64Chars.charAt(tmp << 2 & 63);
    parts.push(`${a}${b}${c}`);
    if (pad) {
      parts.push("=");
    }
  }
  return parts.join("");
}
function getDecodeBase64Length(data2) {
  let bufferLength = Math.floor(data2.length * 0.75);
  const len = data2.length;
  if (data2[len - 1] === "=") {
    bufferLength -= 1;
    if (data2[len - 2] === "=") {
      bufferLength -= 1;
    }
  }
  return bufferLength;
}
function decodeBase64(data2) {
  const bufferLength = getDecodeBase64Length(data2);
  const len = data2.length;
  const bytes = new Uint8Array(bufferLength);
  let p = 0;
  for (let i = 0; i < len; i += 4) {
    const encoded1 = base64Lookup[data2.charCodeAt(i)];
    const encoded2 = base64Lookup[data2.charCodeAt(i + 1)];
    const encoded3 = base64Lookup[data2.charCodeAt(i + 2)];
    const encoded4 = base64Lookup[data2.charCodeAt(i + 3)];
    bytes[p] = encoded1 << 2 | encoded2 >> 4;
    p += 1;
    bytes[p] = (encoded2 & 15) << 4 | encoded3 >> 2;
    p += 1;
    bytes[p] = (encoded3 & 3) << 6 | encoded4 & 63;
    p += 1;
  }
  return bytes;
}
function WASMInterface(binary, hashLength) {
  return __awaiter(this, void 0, void 0, function* () {
    let wasmInstance = null;
    let memoryView = null;
    let initialized = false;
    if (typeof WebAssembly === "undefined") {
      throw new Error("WebAssembly is not supported in this environment!");
    }
    const writeMemory = (data2, offset = 0) => {
      memoryView.set(data2, offset);
    };
    const getMemory = () => memoryView;
    const getExports = () => wasmInstance.exports;
    const setMemorySize = (totalSize) => {
      wasmInstance.exports.Hash_SetMemorySize(totalSize);
      const arrayOffset = wasmInstance.exports.Hash_GetBuffer();
      const memoryBuffer = wasmInstance.exports.memory.buffer;
      memoryView = new Uint8Array(memoryBuffer, arrayOffset, totalSize);
    };
    const getStateSize = () => {
      const view = new DataView(wasmInstance.exports.memory.buffer);
      const stateSize = view.getUint32(wasmInstance.exports.STATE_SIZE, true);
      return stateSize;
    };
    const loadWASMPromise = wasmMutex.dispatch(() => __awaiter(this, void 0, void 0, function* () {
      if (!wasmModuleCache.has(binary.name)) {
        const asm = decodeBase64(binary.data);
        const promise = WebAssembly.compile(asm);
        wasmModuleCache.set(binary.name, promise);
      }
      const module = yield wasmModuleCache.get(binary.name);
      wasmInstance = yield WebAssembly.instantiate(module, {
        // env: {
        //   emscripten_memcpy_big: (dest, src, num) => {
        //     const memoryBuffer = wasmInstance.exports.memory.buffer;
        //     const memView = new Uint8Array(memoryBuffer, 0);
        //     memView.set(memView.subarray(src, src + num), dest);
        //   },
        //   print_memory: (offset, len) => {
        //     const memoryBuffer = wasmInstance.exports.memory.buffer;
        //     const memView = new Uint8Array(memoryBuffer, 0);
        //     console.log('print_int32', memView.subarray(offset, offset + len));
        //   },
        // },
      });
    }));
    const setupInterface = () => __awaiter(this, void 0, void 0, function* () {
      if (!wasmInstance) {
        yield loadWASMPromise;
      }
      const arrayOffset = wasmInstance.exports.Hash_GetBuffer();
      const memoryBuffer = wasmInstance.exports.memory.buffer;
      memoryView = new Uint8Array(memoryBuffer, arrayOffset, MAX_HEAP);
    });
    const init = (bits = null) => {
      initialized = true;
      wasmInstance.exports.Hash_Init(bits);
    };
    const updateUInt8Array = (data2) => {
      let read = 0;
      while (read < data2.length) {
        const chunk = data2.subarray(read, read + MAX_HEAP);
        read += chunk.length;
        memoryView.set(chunk);
        wasmInstance.exports.Hash_Update(chunk.length);
      }
    };
    const update = (data2) => {
      if (!initialized) {
        throw new Error("update() called before init()");
      }
      const Uint8Buffer = getUInt8Buffer(data2);
      updateUInt8Array(Uint8Buffer);
    };
    const digestChars = new Uint8Array(hashLength * 2);
    const digest = (outputType, padding = null) => {
      if (!initialized) {
        throw new Error("digest() called before init()");
      }
      initialized = false;
      wasmInstance.exports.Hash_Final(padding);
      if (outputType === "binary") {
        return memoryView.slice(0, hashLength);
      }
      return getDigestHex(digestChars, memoryView, hashLength);
    };
    const save = () => {
      if (!initialized) {
        throw new Error("save() can only be called after init() and before digest()");
      }
      const stateOffset = wasmInstance.exports.Hash_GetState();
      const stateLength = getStateSize();
      const memoryBuffer = wasmInstance.exports.memory.buffer;
      const internalState = new Uint8Array(memoryBuffer, stateOffset, stateLength);
      const prefixedState = new Uint8Array(WASM_FUNC_HASH_LENGTH + stateLength);
      writeHexToUInt8(prefixedState, binary.hash);
      prefixedState.set(internalState, WASM_FUNC_HASH_LENGTH);
      return prefixedState;
    };
    const load = (state) => {
      if (!(state instanceof Uint8Array)) {
        throw new Error("load() expects an Uint8Array generated by save()");
      }
      const stateOffset = wasmInstance.exports.Hash_GetState();
      const stateLength = getStateSize();
      const overallLength = WASM_FUNC_HASH_LENGTH + stateLength;
      const memoryBuffer = wasmInstance.exports.memory.buffer;
      if (state.length !== overallLength) {
        throw new Error(`Bad state length (expected ${overallLength} bytes, got ${state.length})`);
      }
      if (!hexStringEqualsUInt8(binary.hash, state.subarray(0, WASM_FUNC_HASH_LENGTH))) {
        throw new Error("This state was written by an incompatible hash implementation");
      }
      const internalState = state.subarray(WASM_FUNC_HASH_LENGTH);
      new Uint8Array(memoryBuffer, stateOffset, stateLength).set(internalState);
      initialized = true;
    };
    const isDataShort = (data2) => {
      if (typeof data2 === "string") {
        return data2.length < MAX_HEAP / 4;
      }
      return data2.byteLength < MAX_HEAP;
    };
    let canSimplify = isDataShort;
    switch (binary.name) {
      case "argon2":
      case "scrypt":
        canSimplify = () => true;
        break;
      case "blake2b":
      case "blake2s":
        canSimplify = (data2, initParam) => initParam <= 512 && isDataShort(data2);
        break;
      case "blake3":
        canSimplify = (data2, initParam) => initParam === 0 && isDataShort(data2);
        break;
      case "xxhash64":
      // cannot simplify
      case "xxhash3":
      case "xxhash128":
      case "crc64":
        canSimplify = () => false;
        break;
    }
    const calculate = (data2, initParam = null, digestParam = null) => {
      if (!canSimplify(data2, initParam)) {
        init(initParam);
        update(data2);
        return digest("hex", digestParam);
      }
      const buffer = getUInt8Buffer(data2);
      memoryView.set(buffer);
      wasmInstance.exports.Hash_Calculate(buffer.length, initParam, digestParam);
      return getDigestHex(digestChars, memoryView, hashLength);
    };
    yield setupInterface();
    return {
      getMemory,
      writeMemory,
      getExports,
      setMemorySize,
      init,
      update,
      digest,
      save,
      load,
      calculate,
      hashLength
    };
  });
}
function lockedCreate(mutex2, binary, hashLength) {
  return __awaiter(this, void 0, void 0, function* () {
    const unlock = yield mutex2.lock();
    const wasm = yield WASMInterface(binary, hashLength);
    unlock();
    return wasm;
  });
}
function adler32(data2) {
  if (wasmCache$l === null) {
    return lockedCreate(mutex$l, wasmJson$l, 4).then((wasm) => {
      wasmCache$l = wasm;
      return wasmCache$l.calculate(data2);
    });
  }
  try {
    const hash2 = wasmCache$l.calculate(data2);
    return Promise.resolve(hash2);
  } catch (err) {
    return Promise.reject(err);
  }
}
function createAdler32() {
  return WASMInterface(wasmJson$l, 4).then((wasm) => {
    wasm.init();
    const obj = {
      init: () => {
        wasm.init();
        return obj;
      },
      update: (data2) => {
        wasm.update(data2);
        return obj;
      },
      // biome-ignore lint/suspicious/noExplicitAny: Conflict with IHasher type
      digest: (outputType) => wasm.digest(outputType),
      save: () => wasm.save(),
      load: (data2) => {
        wasm.load(data2);
        return obj;
      },
      blockSize: 4,
      digestSize: 4
    };
    return obj;
  });
}
function validateBits$4(bits) {
  if (!Number.isInteger(bits) || bits < 8 || bits > 512 || bits % 8 !== 0) {
    return new Error("Invalid variant! Valid values: 8, 16, ..., 512");
  }
  return null;
}
function getInitParam$1(outputBits, keyBits) {
  return outputBits | keyBits << 16;
}
function blake2b(data2, bits = 512, key = null) {
  if (validateBits$4(bits)) {
    return Promise.reject(validateBits$4(bits));
  }
  let keyBuffer = null;
  let initParam = bits;
  if (key !== null) {
    keyBuffer = getUInt8Buffer(key);
    if (keyBuffer.length > 64) {
      return Promise.reject(new Error("Max key length is 64 bytes"));
    }
    initParam = getInitParam$1(bits, keyBuffer.length);
  }
  const hashLength = bits / 8;
  if (wasmCache$k === null || wasmCache$k.hashLength !== hashLength) {
    return lockedCreate(mutex$k, wasmJson$j, hashLength).then((wasm) => {
      wasmCache$k = wasm;
      if (initParam > 512) {
        wasmCache$k.writeMemory(keyBuffer);
      }
      return wasmCache$k.calculate(data2, initParam);
    });
  }
  try {
    if (initParam > 512) {
      wasmCache$k.writeMemory(keyBuffer);
    }
    const hash2 = wasmCache$k.calculate(data2, initParam);
    return Promise.resolve(hash2);
  } catch (err) {
    return Promise.reject(err);
  }
}
function createBLAKE2b(bits = 512, key = null) {
  if (validateBits$4(bits)) {
    return Promise.reject(validateBits$4(bits));
  }
  let keyBuffer = null;
  let initParam = bits;
  if (key !== null) {
    keyBuffer = getUInt8Buffer(key);
    if (keyBuffer.length > 64) {
      return Promise.reject(new Error("Max key length is 64 bytes"));
    }
    initParam = getInitParam$1(bits, keyBuffer.length);
  }
  const outputSize = bits / 8;
  return WASMInterface(wasmJson$j, outputSize).then((wasm) => {
    if (initParam > 512) {
      wasm.writeMemory(keyBuffer);
    }
    wasm.init(initParam);
    const obj = {
      init: initParam > 512 ? () => {
        wasm.writeMemory(keyBuffer);
        wasm.init(initParam);
        return obj;
      } : () => {
        wasm.init(initParam);
        return obj;
      },
      update: (data2) => {
        wasm.update(data2);
        return obj;
      },
      // biome-ignore lint/suspicious/noExplicitAny: Conflict with IHasher type
      digest: (outputType) => wasm.digest(outputType),
      save: () => wasm.save(),
      load: (data2) => {
        wasm.load(data2);
        return obj;
      },
      blockSize: 128,
      digestSize: outputSize
    };
    return obj;
  });
}
function encodeResult(salt, options, res) {
  const parameters = [
    `m=${options.memorySize}`,
    `t=${options.iterations}`,
    `p=${options.parallelism}`
  ].join(",");
  return `$argon2${options.hashType}$v=19$${parameters}$${encodeBase64(salt, false)}$${encodeBase64(res, false)}`;
}
function int32LE(x) {
  uint32View.setInt32(0, x, true);
  return new Uint8Array(uint32View.buffer);
}
function hashFunc(blake512, buf, len) {
  return __awaiter(this, void 0, void 0, function* () {
    if (len <= 64) {
      const blake = yield createBLAKE2b(len * 8);
      blake.update(int32LE(len));
      blake.update(buf);
      return blake.digest("binary");
    }
    const r = Math.ceil(len / 32) - 2;
    const ret = new Uint8Array(len);
    blake512.init();
    blake512.update(int32LE(len));
    blake512.update(buf);
    let vp = blake512.digest("binary");
    ret.set(vp.subarray(0, 32), 0);
    for (let i = 1; i < r; i++) {
      blake512.init();
      blake512.update(vp);
      vp = blake512.digest("binary");
      ret.set(vp.subarray(0, 32), i * 32);
    }
    const partialBytesNeeded = len - 32 * r;
    let blakeSmall;
    if (partialBytesNeeded === 64) {
      blakeSmall = blake512;
      blakeSmall.init();
    } else {
      blakeSmall = yield createBLAKE2b(partialBytesNeeded * 8);
    }
    blakeSmall.update(vp);
    vp = blakeSmall.digest("binary");
    ret.set(vp.subarray(0, partialBytesNeeded), r * 32);
    return ret;
  });
}
function getHashType(type) {
  switch (type) {
    case "d":
      return 0;
    case "i":
      return 1;
    default:
      return 2;
  }
}
function argon2Internal(options) {
  return __awaiter(this, void 0, void 0, function* () {
    var _a2;
    const { parallelism, iterations, hashLength } = options;
    const password = getUInt8Buffer(options.password);
    const salt = getUInt8Buffer(options.salt);
    const version2 = 19;
    const hashType = getHashType(options.hashType);
    const { memorySize } = options;
    const secret = getUInt8Buffer((_a2 = options.secret) !== null && _a2 !== void 0 ? _a2 : "");
    const [argon2Interface, blake512] = yield Promise.all([
      WASMInterface(wasmJson$k, 1024),
      createBLAKE2b(512)
    ]);
    argon2Interface.setMemorySize(memorySize * 1024 + 1024);
    const initVector = new Uint8Array(24);
    const initVectorView = new DataView(initVector.buffer);
    initVectorView.setInt32(0, parallelism, true);
    initVectorView.setInt32(4, hashLength, true);
    initVectorView.setInt32(8, memorySize, true);
    initVectorView.setInt32(12, iterations, true);
    initVectorView.setInt32(16, version2, true);
    initVectorView.setInt32(20, hashType, true);
    argon2Interface.writeMemory(initVector, memorySize * 1024);
    blake512.init();
    blake512.update(initVector);
    blake512.update(int32LE(password.length));
    blake512.update(password);
    blake512.update(int32LE(salt.length));
    blake512.update(salt);
    blake512.update(int32LE(secret.length));
    blake512.update(secret);
    blake512.update(int32LE(0));
    const segments = Math.floor(memorySize / (parallelism * 4));
    const lanes = segments * 4;
    const param = new Uint8Array(72);
    const H0 = blake512.digest("binary");
    param.set(H0);
    for (let lane = 0; lane < parallelism; lane++) {
      param.set(int32LE(0), 64);
      param.set(int32LE(lane), 68);
      let position = lane * lanes;
      let chunk = yield hashFunc(blake512, param, 1024);
      argon2Interface.writeMemory(chunk, position * 1024);
      position += 1;
      param.set(int32LE(1), 64);
      chunk = yield hashFunc(blake512, param, 1024);
      argon2Interface.writeMemory(chunk, position * 1024);
    }
    const C = new Uint8Array(1024);
    writeHexToUInt8(C, argon2Interface.calculate(new Uint8Array([]), memorySize));
    const res = yield hashFunc(blake512, C, hashLength);
    if (options.outputType === "hex") {
      const digestChars = new Uint8Array(hashLength * 2);
      return getDigestHex(digestChars, res, hashLength);
    }
    if (options.outputType === "encoded") {
      return encodeResult(salt, options, res);
    }
    return res;
  });
}
function argon2i(options) {
  return __awaiter(this, void 0, void 0, function* () {
    validateOptions$3(options);
    return argon2Internal(Object.assign(Object.assign({}, options), { hashType: "i" }));
  });
}
function argon2id(options) {
  return __awaiter(this, void 0, void 0, function* () {
    validateOptions$3(options);
    return argon2Internal(Object.assign(Object.assign({}, options), { hashType: "id" }));
  });
}
function argon2d(options) {
  return __awaiter(this, void 0, void 0, function* () {
    validateOptions$3(options);
    return argon2Internal(Object.assign(Object.assign({}, options), { hashType: "d" }));
  });
}
function argon2Verify(options) {
  return __awaiter(this, void 0, void 0, function* () {
    validateVerifyOptions$1(options);
    const params = getHashParameters(options.password, options.hash, options.secret);
    validateOptions$3(params);
    const hashStart = options.hash.lastIndexOf("$") + 1;
    const result = yield argon2Internal(params);
    return result.substring(hashStart) === options.hash.substring(hashStart);
  });
}
function validateBits$3(bits) {
  if (!Number.isInteger(bits) || bits < 8 || bits > 256 || bits % 8 !== 0) {
    return new Error("Invalid variant! Valid values: 8, 16, ..., 256");
  }
  return null;
}
function getInitParam(outputBits, keyBits) {
  return outputBits | keyBits << 16;
}
function blake2s(data2, bits = 256, key = null) {
  if (validateBits$3(bits)) {
    return Promise.reject(validateBits$3(bits));
  }
  let keyBuffer = null;
  let initParam = bits;
  if (key !== null) {
    keyBuffer = getUInt8Buffer(key);
    if (keyBuffer.length > 32) {
      return Promise.reject(new Error("Max key length is 32 bytes"));
    }
    initParam = getInitParam(bits, keyBuffer.length);
  }
  const hashLength = bits / 8;
  if (wasmCache$j === null || wasmCache$j.hashLength !== hashLength) {
    return lockedCreate(mutex$j, wasmJson$i, hashLength).then((wasm) => {
      wasmCache$j = wasm;
      if (initParam > 512) {
        wasmCache$j.writeMemory(keyBuffer);
      }
      return wasmCache$j.calculate(data2, initParam);
    });
  }
  try {
    if (initParam > 512) {
      wasmCache$j.writeMemory(keyBuffer);
    }
    const hash2 = wasmCache$j.calculate(data2, initParam);
    return Promise.resolve(hash2);
  } catch (err) {
    return Promise.reject(err);
  }
}
function createBLAKE2s(bits = 256, key = null) {
  if (validateBits$3(bits)) {
    return Promise.reject(validateBits$3(bits));
  }
  let keyBuffer = null;
  let initParam = bits;
  if (key !== null) {
    keyBuffer = getUInt8Buffer(key);
    if (keyBuffer.length > 32) {
      return Promise.reject(new Error("Max key length is 32 bytes"));
    }
    initParam = getInitParam(bits, keyBuffer.length);
  }
  const outputSize = bits / 8;
  return WASMInterface(wasmJson$i, outputSize).then((wasm) => {
    if (initParam > 512) {
      wasm.writeMemory(keyBuffer);
    }
    wasm.init(initParam);
    const obj = {
      init: initParam > 512 ? () => {
        wasm.writeMemory(keyBuffer);
        wasm.init(initParam);
        return obj;
      } : () => {
        wasm.init(initParam);
        return obj;
      },
      update: (data2) => {
        wasm.update(data2);
        return obj;
      },
      // biome-ignore lint/suspicious/noExplicitAny: Conflict with IHasher type
      digest: (outputType) => wasm.digest(outputType),
      save: () => wasm.save(),
      load: (data2) => {
        wasm.load(data2);
        return obj;
      },
      blockSize: 64,
      digestSize: outputSize
    };
    return obj;
  });
}
function validateBits$2(bits) {
  if (!Number.isInteger(bits) || bits < 8 || bits % 8 !== 0) {
    return new Error("Invalid variant! Valid values: 8, 16, ...");
  }
  return null;
}
function blake3(data2, bits = 256, key = null) {
  if (validateBits$2(bits)) {
    return Promise.reject(validateBits$2(bits));
  }
  let keyBuffer = null;
  let initParam = 0;
  if (key !== null) {
    keyBuffer = getUInt8Buffer(key);
    if (keyBuffer.length !== 32) {
      return Promise.reject(new Error("Key length must be exactly 32 bytes"));
    }
    initParam = 32;
  }
  const hashLength = bits / 8;
  const digestParam = hashLength;
  if (wasmCache$i === null || wasmCache$i.hashLength !== hashLength) {
    return lockedCreate(mutex$i, wasmJson$h, hashLength).then((wasm) => {
      wasmCache$i = wasm;
      if (initParam === 32) {
        wasmCache$i.writeMemory(keyBuffer);
      }
      return wasmCache$i.calculate(data2, initParam, digestParam);
    });
  }
  try {
    if (initParam === 32) {
      wasmCache$i.writeMemory(keyBuffer);
    }
    const hash2 = wasmCache$i.calculate(data2, initParam, digestParam);
    return Promise.resolve(hash2);
  } catch (err) {
    return Promise.reject(err);
  }
}
function createBLAKE3(bits = 256, key = null) {
  if (validateBits$2(bits)) {
    return Promise.reject(validateBits$2(bits));
  }
  let keyBuffer = null;
  let initParam = 0;
  if (key !== null) {
    keyBuffer = getUInt8Buffer(key);
    if (keyBuffer.length !== 32) {
      return Promise.reject(new Error("Key length must be exactly 32 bytes"));
    }
    initParam = 32;
  }
  const outputSize = bits / 8;
  const digestParam = outputSize;
  return WASMInterface(wasmJson$h, outputSize).then((wasm) => {
    if (initParam === 32) {
      wasm.writeMemory(keyBuffer);
    }
    wasm.init(initParam);
    const obj = {
      init: initParam === 32 ? () => {
        wasm.writeMemory(keyBuffer);
        wasm.init(initParam);
        return obj;
      } : () => {
        wasm.init(initParam);
        return obj;
      },
      update: (data2) => {
        wasm.update(data2);
        return obj;
      },
      // biome-ignore lint/suspicious/noExplicitAny: Conflict with IHasher type
      digest: (outputType) => wasm.digest(outputType, digestParam),
      save: () => wasm.save(),
      load: (data2) => {
        wasm.load(data2);
        return obj;
      },
      blockSize: 64,
      digestSize: outputSize
    };
    return obj;
  });
}
function validatePoly(poly) {
  if (!Number.isInteger(poly) || poly < 0 || poly > 4294967295) {
    return new Error("Polynomial must be a valid 32-bit long unsigned integer");
  }
  return null;
}
function crc32(data2, polynomial = 3988292384) {
  if (validatePoly(polynomial)) {
    return Promise.reject(validatePoly(polynomial));
  }
  if (wasmCache$h === null) {
    return lockedCreate(mutex$h, wasmJson$g, 4).then((wasm) => {
      wasmCache$h = wasm;
      return wasmCache$h.calculate(data2, polynomial);
    });
  }
  try {
    const hash2 = wasmCache$h.calculate(data2, polynomial);
    return Promise.resolve(hash2);
  } catch (err) {
    return Promise.reject(err);
  }
}
function createCRC32(polynomial = 3988292384) {
  if (validatePoly(polynomial)) {
    return Promise.reject(validatePoly(polynomial));
  }
  return WASMInterface(wasmJson$g, 4).then((wasm) => {
    wasm.init(polynomial);
    const obj = {
      init: () => {
        wasm.init(polynomial);
        return obj;
      },
      update: (data2) => {
        wasm.update(data2);
        return obj;
      },
      // biome-ignore lint/suspicious/noExplicitAny: Conflict with IHasher type
      digest: (outputType) => wasm.digest(outputType),
      save: () => wasm.save(),
      load: (data2) => {
        wasm.load(data2);
        return obj;
      },
      blockSize: 4,
      digestSize: 4
    };
    return obj;
  });
}
function parsePoly(poly) {
  const errText = "Polynomial must be provided as a 16 char long hex string";
  if (typeof poly !== "string" || poly.length !== 16) {
    return { hi: 0, lo: 0, err: new Error(errText) };
  }
  const hi = Number(`0x${poly.slice(0, 8)}`);
  const lo = Number(`0x${poly.slice(8)}`);
  if (Number.isNaN(hi) || Number.isNaN(lo)) {
    return { hi, lo, err: new Error(errText) };
  }
  return { hi, lo, err: null };
}
function writePoly(arr, lo, hi) {
  const buffer = new DataView(arr);
  buffer.setUint32(0, lo, true);
  buffer.setUint32(4, hi, true);
}
function crc64(data2, polynomial = "c96c5795d7870f42") {
  const { hi, lo, err } = parsePoly(polynomial);
  if (err !== null) {
    return Promise.reject(err);
  }
  if (wasmCache$g === null) {
    return lockedCreate(mutex$g, wasmJson$f, 8).then((wasm) => {
      wasmCache$g = wasm;
      writePoly(polyBuffer.buffer, lo, hi);
      wasmCache$g.writeMemory(polyBuffer);
      return wasmCache$g.calculate(data2);
    });
  }
  try {
    writePoly(polyBuffer.buffer, lo, hi);
    wasmCache$g.writeMemory(polyBuffer);
    const hash2 = wasmCache$g.calculate(data2);
    return Promise.resolve(hash2);
  } catch (err2) {
    return Promise.reject(err2);
  }
}
function createCRC64(polynomial = "c96c5795d7870f42") {
  const { hi, lo, err } = parsePoly(polynomial);
  if (err !== null) {
    return Promise.reject(err);
  }
  return WASMInterface(wasmJson$f, 8).then((wasm) => {
    const instanceBuffer = new Uint8Array(8);
    writePoly(instanceBuffer.buffer, lo, hi);
    wasm.writeMemory(instanceBuffer);
    wasm.init();
    const obj = {
      init: () => {
        wasm.writeMemory(instanceBuffer);
        wasm.init();
        return obj;
      },
      update: (data2) => {
        wasm.update(data2);
        return obj;
      },
      // biome-ignore lint/suspicious/noExplicitAny: Conflict with IHasher type
      digest: (outputType) => wasm.digest(outputType),
      save: () => wasm.save(),
      load: (data2) => {
        wasm.load(data2);
        return obj;
      },
      blockSize: 8,
      digestSize: 8
    };
    return obj;
  });
}
function md4(data2) {
  if (wasmCache$f === null) {
    return lockedCreate(mutex$f, wasmJson$e, 16).then((wasm) => {
      wasmCache$f = wasm;
      return wasmCache$f.calculate(data2);
    });
  }
  try {
    const hash2 = wasmCache$f.calculate(data2);
    return Promise.resolve(hash2);
  } catch (err) {
    return Promise.reject(err);
  }
}
function createMD4() {
  return WASMInterface(wasmJson$e, 16).then((wasm) => {
    wasm.init();
    const obj = {
      init: () => {
        wasm.init();
        return obj;
      },
      update: (data2) => {
        wasm.update(data2);
        return obj;
      },
      // biome-ignore lint/suspicious/noExplicitAny: Conflict with IHasher type
      digest: (outputType) => wasm.digest(outputType),
      save: () => wasm.save(),
      load: (data2) => {
        wasm.load(data2);
        return obj;
      },
      blockSize: 64,
      digestSize: 16
    };
    return obj;
  });
}
function md5(data2) {
  if (wasmCache$e === null) {
    return lockedCreate(mutex$e, wasmJson$d, 16).then((wasm) => {
      wasmCache$e = wasm;
      return wasmCache$e.calculate(data2);
    });
  }
  try {
    const hash2 = wasmCache$e.calculate(data2);
    return Promise.resolve(hash2);
  } catch (err) {
    return Promise.reject(err);
  }
}
function createMD5() {
  return WASMInterface(wasmJson$d, 16).then((wasm) => {
    wasm.init();
    const obj = {
      init: () => {
        wasm.init();
        return obj;
      },
      update: (data2) => {
        wasm.update(data2);
        return obj;
      },
      // biome-ignore lint/suspicious/noExplicitAny: Conflict with IHasher type
      digest: (outputType) => wasm.digest(outputType),
      save: () => wasm.save(),
      load: (data2) => {
        wasm.load(data2);
        return obj;
      },
      blockSize: 64,
      digestSize: 16
    };
    return obj;
  });
}
function sha1(data2) {
  if (wasmCache$d === null) {
    return lockedCreate(mutex$d, wasmJson$c, 20).then((wasm) => {
      wasmCache$d = wasm;
      return wasmCache$d.calculate(data2);
    });
  }
  try {
    const hash2 = wasmCache$d.calculate(data2);
    return Promise.resolve(hash2);
  } catch (err) {
    return Promise.reject(err);
  }
}
function createSHA1() {
  return WASMInterface(wasmJson$c, 20).then((wasm) => {
    wasm.init();
    const obj = {
      init: () => {
        wasm.init();
        return obj;
      },
      update: (data2) => {
        wasm.update(data2);
        return obj;
      },
      // biome-ignore lint/suspicious/noExplicitAny: Conflict with IHasher type
      digest: (outputType) => wasm.digest(outputType),
      save: () => wasm.save(),
      load: (data2) => {
        wasm.load(data2);
        return obj;
      },
      blockSize: 64,
      digestSize: 20
    };
    return obj;
  });
}
function validateBits$1(bits) {
  if (![224, 256, 384, 512].includes(bits)) {
    return new Error("Invalid variant! Valid values: 224, 256, 384, 512");
  }
  return null;
}
function sha3(data2, bits = 512) {
  if (validateBits$1(bits)) {
    return Promise.reject(validateBits$1(bits));
  }
  const hashLength = bits / 8;
  if (wasmCache$c === null || wasmCache$c.hashLength !== hashLength) {
    return lockedCreate(mutex$c, wasmJson$b, hashLength).then((wasm) => {
      wasmCache$c = wasm;
      return wasmCache$c.calculate(data2, bits, 6);
    });
  }
  try {
    const hash2 = wasmCache$c.calculate(data2, bits, 6);
    return Promise.resolve(hash2);
  } catch (err) {
    return Promise.reject(err);
  }
}
function createSHA3(bits = 512) {
  if (validateBits$1(bits)) {
    return Promise.reject(validateBits$1(bits));
  }
  const outputSize = bits / 8;
  return WASMInterface(wasmJson$b, outputSize).then((wasm) => {
    wasm.init(bits);
    const obj = {
      init: () => {
        wasm.init(bits);
        return obj;
      },
      update: (data2) => {
        wasm.update(data2);
        return obj;
      },
      // biome-ignore lint/suspicious/noExplicitAny: Conflict with IHasher type
      digest: (outputType) => wasm.digest(outputType, 6),
      save: () => wasm.save(),
      load: (data2) => {
        wasm.load(data2);
        return obj;
      },
      blockSize: 200 - 2 * outputSize,
      digestSize: outputSize
    };
    return obj;
  });
}
function validateBits(bits) {
  if (![224, 256, 384, 512].includes(bits)) {
    return new Error("Invalid variant! Valid values: 224, 256, 384, 512");
  }
  return null;
}
function keccak(data2, bits = 512) {
  if (validateBits(bits)) {
    return Promise.reject(validateBits(bits));
  }
  const hashLength = bits / 8;
  if (wasmCache$b === null || wasmCache$b.hashLength !== hashLength) {
    return lockedCreate(mutex$b, wasmJson$b, hashLength).then((wasm) => {
      wasmCache$b = wasm;
      return wasmCache$b.calculate(data2, bits, 1);
    });
  }
  try {
    const hash2 = wasmCache$b.calculate(data2, bits, 1);
    return Promise.resolve(hash2);
  } catch (err) {
    return Promise.reject(err);
  }
}
function createKeccak(bits = 512) {
  if (validateBits(bits)) {
    return Promise.reject(validateBits(bits));
  }
  const outputSize = bits / 8;
  return WASMInterface(wasmJson$b, outputSize).then((wasm) => {
    wasm.init(bits);
    const obj = {
      init: () => {
        wasm.init(bits);
        return obj;
      },
      update: (data2) => {
        wasm.update(data2);
        return obj;
      },
      // biome-ignore lint/suspicious/noExplicitAny: Conflict with IHasher type
      digest: (outputType) => wasm.digest(outputType, 1),
      save: () => wasm.save(),
      load: (data2) => {
        wasm.load(data2);
        return obj;
      },
      blockSize: 200 - 2 * outputSize,
      digestSize: outputSize
    };
    return obj;
  });
}
function sha224(data2) {
  if (wasmCache$a === null) {
    return lockedCreate(mutex$a, wasmJson$a, 28).then((wasm) => {
      wasmCache$a = wasm;
      return wasmCache$a.calculate(data2, 224);
    });
  }
  try {
    const hash2 = wasmCache$a.calculate(data2, 224);
    return Promise.resolve(hash2);
  } catch (err) {
    return Promise.reject(err);
  }
}
function createSHA224() {
  return WASMInterface(wasmJson$a, 28).then((wasm) => {
    wasm.init(224);
    const obj = {
      init: () => {
        wasm.init(224);
        return obj;
      },
      update: (data2) => {
        wasm.update(data2);
        return obj;
      },
      // biome-ignore lint/suspicious/noExplicitAny: Conflict with IHasher type
      digest: (outputType) => wasm.digest(outputType),
      save: () => wasm.save(),
      load: (data2) => {
        wasm.load(data2);
        return obj;
      },
      blockSize: 64,
      digestSize: 28
    };
    return obj;
  });
}
function sha256(data2) {
  if (wasmCache$9 === null) {
    return lockedCreate(mutex$9, wasmJson$a, 32).then((wasm) => {
      wasmCache$9 = wasm;
      return wasmCache$9.calculate(data2, 256);
    });
  }
  try {
    const hash2 = wasmCache$9.calculate(data2, 256);
    return Promise.resolve(hash2);
  } catch (err) {
    return Promise.reject(err);
  }
}
function createSHA256() {
  return WASMInterface(wasmJson$a, 32).then((wasm) => {
    wasm.init(256);
    const obj = {
      init: () => {
        wasm.init(256);
        return obj;
      },
      update: (data2) => {
        wasm.update(data2);
        return obj;
      },
      // biome-ignore lint/suspicious/noExplicitAny: Conflict with IHasher type
      digest: (outputType) => wasm.digest(outputType),
      save: () => wasm.save(),
      load: (data2) => {
        wasm.load(data2);
        return obj;
      },
      blockSize: 64,
      digestSize: 32
    };
    return obj;
  });
}
function sha384(data2) {
  if (wasmCache$8 === null) {
    return lockedCreate(mutex$8, wasmJson$9, 48).then((wasm) => {
      wasmCache$8 = wasm;
      return wasmCache$8.calculate(data2, 384);
    });
  }
  try {
    const hash2 = wasmCache$8.calculate(data2, 384);
    return Promise.resolve(hash2);
  } catch (err) {
    return Promise.reject(err);
  }
}
function createSHA384() {
  return WASMInterface(wasmJson$9, 48).then((wasm) => {
    wasm.init(384);
    const obj = {
      init: () => {
        wasm.init(384);
        return obj;
      },
      update: (data2) => {
        wasm.update(data2);
        return obj;
      },
      // biome-ignore lint/suspicious/noExplicitAny: Conflict with IHasher type
      digest: (outputType) => wasm.digest(outputType),
      save: () => wasm.save(),
      load: (data2) => {
        wasm.load(data2);
        return obj;
      },
      blockSize: 128,
      digestSize: 48
    };
    return obj;
  });
}
function sha512(data2) {
  if (wasmCache$7 === null) {
    return lockedCreate(mutex$7, wasmJson$9, 64).then((wasm) => {
      wasmCache$7 = wasm;
      return wasmCache$7.calculate(data2, 512);
    });
  }
  try {
    const hash2 = wasmCache$7.calculate(data2, 512);
    return Promise.resolve(hash2);
  } catch (err) {
    return Promise.reject(err);
  }
}
function createSHA512() {
  return WASMInterface(wasmJson$9, 64).then((wasm) => {
    wasm.init(512);
    const obj = {
      init: () => {
        wasm.init(512);
        return obj;
      },
      update: (data2) => {
        wasm.update(data2);
        return obj;
      },
      // biome-ignore lint/suspicious/noExplicitAny: Conflict with IHasher type
      digest: (outputType) => wasm.digest(outputType),
      save: () => wasm.save(),
      load: (data2) => {
        wasm.load(data2);
        return obj;
      },
      blockSize: 128,
      digestSize: 64
    };
    return obj;
  });
}
function validateSeed$3(seed) {
  if (!Number.isInteger(seed) || seed < 0 || seed > 4294967295) {
    return new Error("Seed must be a valid 32-bit long unsigned integer.");
  }
  return null;
}
function xxhash32(data2, seed = 0) {
  if (validateSeed$3(seed)) {
    return Promise.reject(validateSeed$3(seed));
  }
  if (wasmCache$6 === null) {
    return lockedCreate(mutex$6, wasmJson$8, 4).then((wasm) => {
      wasmCache$6 = wasm;
      return wasmCache$6.calculate(data2, seed);
    });
  }
  try {
    const hash2 = wasmCache$6.calculate(data2, seed);
    return Promise.resolve(hash2);
  } catch (err) {
    return Promise.reject(err);
  }
}
function createXXHash32(seed = 0) {
  if (validateSeed$3(seed)) {
    return Promise.reject(validateSeed$3(seed));
  }
  return WASMInterface(wasmJson$8, 4).then((wasm) => {
    wasm.init(seed);
    const obj = {
      init: () => {
        wasm.init(seed);
        return obj;
      },
      update: (data2) => {
        wasm.update(data2);
        return obj;
      },
      // biome-ignore lint/suspicious/noExplicitAny: Conflict with IHasher type
      digest: (outputType) => wasm.digest(outputType),
      save: () => wasm.save(),
      load: (data2) => {
        wasm.load(data2);
        return obj;
      },
      blockSize: 16,
      digestSize: 4
    };
    return obj;
  });
}
function validateSeed$2(seed) {
  if (!Number.isInteger(seed) || seed < 0 || seed > 4294967295) {
    return new Error("Seed must be given as two valid 32-bit long unsigned integers (lo + high).");
  }
  return null;
}
function writeSeed$2(arr, low, high) {
  const buffer = new DataView(arr);
  buffer.setUint32(0, low, true);
  buffer.setUint32(4, high, true);
}
function xxhash64(data2, seedLow = 0, seedHigh = 0) {
  if (validateSeed$2(seedLow)) {
    return Promise.reject(validateSeed$2(seedLow));
  }
  if (validateSeed$2(seedHigh)) {
    return Promise.reject(validateSeed$2(seedHigh));
  }
  if (wasmCache$5 === null) {
    return lockedCreate(mutex$5, wasmJson$7, 8).then((wasm) => {
      wasmCache$5 = wasm;
      writeSeed$2(seedBuffer$2.buffer, seedLow, seedHigh);
      wasmCache$5.writeMemory(seedBuffer$2);
      return wasmCache$5.calculate(data2);
    });
  }
  try {
    writeSeed$2(seedBuffer$2.buffer, seedLow, seedHigh);
    wasmCache$5.writeMemory(seedBuffer$2);
    const hash2 = wasmCache$5.calculate(data2);
    return Promise.resolve(hash2);
  } catch (err) {
    return Promise.reject(err);
  }
}
function createXXHash64(seedLow = 0, seedHigh = 0) {
  if (validateSeed$2(seedLow)) {
    return Promise.reject(validateSeed$2(seedLow));
  }
  if (validateSeed$2(seedHigh)) {
    return Promise.reject(validateSeed$2(seedHigh));
  }
  return WASMInterface(wasmJson$7, 8).then((wasm) => {
    const instanceBuffer = new Uint8Array(8);
    writeSeed$2(instanceBuffer.buffer, seedLow, seedHigh);
    wasm.writeMemory(instanceBuffer);
    wasm.init();
    const obj = {
      init: () => {
        wasm.writeMemory(instanceBuffer);
        wasm.init();
        return obj;
      },
      update: (data2) => {
        wasm.update(data2);
        return obj;
      },
      // biome-ignore lint/suspicious/noExplicitAny: Conflict with IHasher type
      digest: (outputType) => wasm.digest(outputType),
      save: () => wasm.save(),
      load: (data2) => {
        wasm.load(data2);
        return obj;
      },
      blockSize: 32,
      digestSize: 8
    };
    return obj;
  });
}
function validateSeed$1(seed) {
  if (!Number.isInteger(seed) || seed < 0 || seed > 4294967295) {
    return new Error("Seed must be given as two valid 32-bit long unsigned integers (lo + high).");
  }
  return null;
}
function writeSeed$1(arr, low, high) {
  const buffer = new DataView(arr);
  buffer.setUint32(0, low, true);
  buffer.setUint32(4, high, true);
}
function xxhash3(data2, seedLow = 0, seedHigh = 0) {
  if (validateSeed$1(seedLow)) {
    return Promise.reject(validateSeed$1(seedLow));
  }
  if (validateSeed$1(seedHigh)) {
    return Promise.reject(validateSeed$1(seedHigh));
  }
  if (wasmCache$4 === null) {
    return lockedCreate(mutex$4, wasmJson$6, 8).then((wasm) => {
      wasmCache$4 = wasm;
      writeSeed$1(seedBuffer$1.buffer, seedLow, seedHigh);
      wasmCache$4.writeMemory(seedBuffer$1);
      return wasmCache$4.calculate(data2);
    });
  }
  try {
    writeSeed$1(seedBuffer$1.buffer, seedLow, seedHigh);
    wasmCache$4.writeMemory(seedBuffer$1);
    const hash2 = wasmCache$4.calculate(data2);
    return Promise.resolve(hash2);
  } catch (err) {
    return Promise.reject(err);
  }
}
function createXXHash3(seedLow = 0, seedHigh = 0) {
  if (validateSeed$1(seedLow)) {
    return Promise.reject(validateSeed$1(seedLow));
  }
  if (validateSeed$1(seedHigh)) {
    return Promise.reject(validateSeed$1(seedHigh));
  }
  return WASMInterface(wasmJson$6, 8).then((wasm) => {
    const instanceBuffer = new Uint8Array(8);
    writeSeed$1(instanceBuffer.buffer, seedLow, seedHigh);
    wasm.writeMemory(instanceBuffer);
    wasm.init();
    const obj = {
      init: () => {
        wasm.writeMemory(instanceBuffer);
        wasm.init();
        return obj;
      },
      update: (data2) => {
        wasm.update(data2);
        return obj;
      },
      // biome-ignore lint/suspicious/noExplicitAny: Conflict with IHasher type
      digest: (outputType) => wasm.digest(outputType),
      save: () => wasm.save(),
      load: (data2) => {
        wasm.load(data2);
        return obj;
      },
      blockSize: 512,
      digestSize: 8
    };
    return obj;
  });
}
function validateSeed(seed) {
  if (!Number.isInteger(seed) || seed < 0 || seed > 4294967295) {
    return new Error("Seed must be given as two valid 32-bit long unsigned integers (lo + high).");
  }
  return null;
}
function writeSeed(arr, low, high) {
  const buffer = new DataView(arr);
  buffer.setUint32(0, low, true);
  buffer.setUint32(4, high, true);
}
function xxhash128(data2, seedLow = 0, seedHigh = 0) {
  if (validateSeed(seedLow)) {
    return Promise.reject(validateSeed(seedLow));
  }
  if (validateSeed(seedHigh)) {
    return Promise.reject(validateSeed(seedHigh));
  }
  if (wasmCache$3 === null) {
    return lockedCreate(mutex$3, wasmJson$5, 16).then((wasm) => {
      wasmCache$3 = wasm;
      writeSeed(seedBuffer.buffer, seedLow, seedHigh);
      wasmCache$3.writeMemory(seedBuffer);
      return wasmCache$3.calculate(data2);
    });
  }
  try {
    writeSeed(seedBuffer.buffer, seedLow, seedHigh);
    wasmCache$3.writeMemory(seedBuffer);
    const hash2 = wasmCache$3.calculate(data2);
    return Promise.resolve(hash2);
  } catch (err) {
    return Promise.reject(err);
  }
}
function createXXHash128(seedLow = 0, seedHigh = 0) {
  if (validateSeed(seedLow)) {
    return Promise.reject(validateSeed(seedLow));
  }
  if (validateSeed(seedHigh)) {
    return Promise.reject(validateSeed(seedHigh));
  }
  return WASMInterface(wasmJson$5, 16).then((wasm) => {
    const instanceBuffer = new Uint8Array(8);
    writeSeed(instanceBuffer.buffer, seedLow, seedHigh);
    wasm.writeMemory(instanceBuffer);
    wasm.init();
    const obj = {
      init: () => {
        wasm.writeMemory(instanceBuffer);
        wasm.init();
        return obj;
      },
      update: (data2) => {
        wasm.update(data2);
        return obj;
      },
      // biome-ignore lint/suspicious/noExplicitAny: Conflict with IHasher type
      digest: (outputType) => wasm.digest(outputType),
      save: () => wasm.save(),
      load: (data2) => {
        wasm.load(data2);
        return obj;
      },
      blockSize: 512,
      digestSize: 16
    };
    return obj;
  });
}
function ripemd160(data2) {
  if (wasmCache$2 === null) {
    return lockedCreate(mutex$2, wasmJson$4, 20).then((wasm) => {
      wasmCache$2 = wasm;
      return wasmCache$2.calculate(data2);
    });
  }
  try {
    const hash2 = wasmCache$2.calculate(data2);
    return Promise.resolve(hash2);
  } catch (err) {
    return Promise.reject(err);
  }
}
function createRIPEMD160() {
  return WASMInterface(wasmJson$4, 20).then((wasm) => {
    wasm.init();
    const obj = {
      init: () => {
        wasm.init();
        return obj;
      },
      update: (data2) => {
        wasm.update(data2);
        return obj;
      },
      // biome-ignore lint/suspicious/noExplicitAny: Conflict with IHasher type
      digest: (outputType) => wasm.digest(outputType),
      save: () => wasm.save(),
      load: (data2) => {
        wasm.load(data2);
        return obj;
      },
      blockSize: 64,
      digestSize: 20
    };
    return obj;
  });
}
function calculateKeyBuffer(hasher, key) {
  const { blockSize } = hasher;
  const buf = getUInt8Buffer(key);
  if (buf.length > blockSize) {
    hasher.update(buf);
    const uintArr = hasher.digest("binary");
    hasher.init();
    return uintArr;
  }
  return new Uint8Array(buf.buffer, buf.byteOffset, buf.length);
}
function calculateHmac(hasher, key) {
  hasher.init();
  const { blockSize } = hasher;
  const keyBuf = calculateKeyBuffer(hasher, key);
  const keyBuffer = new Uint8Array(blockSize);
  keyBuffer.set(keyBuf);
  const opad = new Uint8Array(blockSize);
  for (let i = 0; i < blockSize; i++) {
    const v = keyBuffer[i];
    opad[i] = v ^ 92;
    keyBuffer[i] = v ^ 54;
  }
  hasher.update(keyBuffer);
  const obj = {
    init: () => {
      hasher.init();
      hasher.update(keyBuffer);
      return obj;
    },
    update: (data2) => {
      hasher.update(data2);
      return obj;
    },
    digest: ((outputType) => {
      const uintArr = hasher.digest("binary");
      hasher.init();
      hasher.update(opad);
      hasher.update(uintArr);
      return hasher.digest(outputType);
    }),
    save: () => {
      throw new Error("save() not supported");
    },
    load: () => {
      throw new Error("load() not supported");
    },
    blockSize: hasher.blockSize,
    digestSize: hasher.digestSize
  };
  return obj;
}
function createHMAC(hash2, key) {
  if (!hash2 || !hash2.then) {
    throw new Error('Invalid hash function is provided! Usage: createHMAC(createMD5(), "key").');
  }
  return hash2.then((hasher) => calculateHmac(hasher, key));
}
function calculatePBKDF2(digest, salt, iterations, hashLength, outputType) {
  return __awaiter(this, void 0, void 0, function* () {
    const DK = new Uint8Array(hashLength);
    const block1 = new Uint8Array(salt.length + 4);
    const block1View = new DataView(block1.buffer);
    const saltBuffer = getUInt8Buffer(salt);
    const saltUIntBuffer = new Uint8Array(saltBuffer.buffer, saltBuffer.byteOffset, saltBuffer.length);
    block1.set(saltUIntBuffer);
    let destPos = 0;
    const hLen = digest.digestSize;
    const l = Math.ceil(hashLength / hLen);
    let T = null;
    let U = null;
    for (let i = 1; i <= l; i++) {
      block1View.setUint32(salt.length, i);
      digest.init();
      digest.update(block1);
      T = digest.digest("binary");
      U = T.slice();
      for (let j = 1; j < iterations; j++) {
        digest.init();
        digest.update(U);
        U = digest.digest("binary");
        for (let k = 0; k < hLen; k++) {
          T[k] ^= U[k];
        }
      }
      DK.set(T.subarray(0, hashLength - destPos), destPos);
      destPos += hLen;
    }
    if (outputType === "binary") {
      return DK;
    }
    const digestChars = new Uint8Array(hashLength * 2);
    return getDigestHex(digestChars, DK, hashLength);
  });
}
function pbkdf2(options) {
  return __awaiter(this, void 0, void 0, function* () {
    validateOptions$2(options);
    const hmac2 = yield createHMAC(options.hashFunction, options.password);
    return calculatePBKDF2(hmac2, options.salt, options.iterations, options.hashLength, options.outputType);
  });
}
function scryptInternal(options) {
  return __awaiter(this, void 0, void 0, function* () {
    const { costFactor, blockSize, parallelism, hashLength } = options;
    const SHA256Hasher = createSHA256();
    const blockData = yield pbkdf2({
      password: options.password,
      salt: options.salt,
      iterations: 1,
      hashLength: 128 * blockSize * parallelism,
      hashFunction: SHA256Hasher,
      outputType: "binary"
    });
    const scryptInterface = yield WASMInterface(wasmJson$3, 0);
    const VSize = 128 * blockSize * costFactor;
    const XYSize = 256 * blockSize;
    scryptInterface.setMemorySize(blockData.length + VSize + XYSize);
    scryptInterface.writeMemory(blockData, 0);
    scryptInterface.getExports().scrypt(blockSize, costFactor, parallelism);
    const expensiveSalt = scryptInterface.getMemory().subarray(0, 128 * blockSize * parallelism);
    const outputData = yield pbkdf2({
      password: options.password,
      salt: expensiveSalt,
      iterations: 1,
      hashLength,
      hashFunction: SHA256Hasher,
      outputType: "binary"
    });
    if (options.outputType === "hex") {
      const digestChars = new Uint8Array(hashLength * 2);
      return getDigestHex(digestChars, outputData, hashLength);
    }
    return outputData;
  });
}
function scrypt(options) {
  return __awaiter(this, void 0, void 0, function* () {
    validateOptions$1(options);
    return scryptInternal(options);
  });
}
function bcryptInternal(options) {
  return __awaiter(this, void 0, void 0, function* () {
    const { costFactor, password, salt } = options;
    const bcryptInterface = yield WASMInterface(wasmJson$2, 0);
    bcryptInterface.writeMemory(getUInt8Buffer(salt), 0);
    const passwordBuffer = getUInt8Buffer(password);
    bcryptInterface.writeMemory(passwordBuffer, 16);
    const shouldEncode = options.outputType === "encoded" ? 1 : 0;
    bcryptInterface.getExports().bcrypt(passwordBuffer.length, costFactor, shouldEncode);
    const memory = bcryptInterface.getMemory();
    if (options.outputType === "encoded") {
      return intArrayToString(memory, 60);
    }
    if (options.outputType === "hex") {
      const digestChars = new Uint8Array(24 * 2);
      return getDigestHex(digestChars, memory, 24);
    }
    return memory.slice(0, 24);
  });
}
function bcrypt(options) {
  return __awaiter(this, void 0, void 0, function* () {
    validateOptions(options);
    return bcryptInternal(options);
  });
}
function bcryptVerify(options) {
  return __awaiter(this, void 0, void 0, function* () {
    validateVerifyOptions(options);
    const { hash: hash2, password } = options;
    const bcryptInterface = yield WASMInterface(wasmJson$2, 0);
    bcryptInterface.writeMemory(getUInt8Buffer(hash2), 0);
    const passwordBuffer = getUInt8Buffer(password);
    bcryptInterface.writeMemory(passwordBuffer, 60);
    return !!bcryptInterface.getExports().bcrypt_verify(passwordBuffer.length);
  });
}
function whirlpool(data2) {
  if (wasmCache$1 === null) {
    return lockedCreate(mutex$1, wasmJson$1, 64).then((wasm) => {
      wasmCache$1 = wasm;
      return wasmCache$1.calculate(data2);
    });
  }
  try {
    const hash2 = wasmCache$1.calculate(data2);
    return Promise.resolve(hash2);
  } catch (err) {
    return Promise.reject(err);
  }
}
function createWhirlpool() {
  return WASMInterface(wasmJson$1, 64).then((wasm) => {
    wasm.init();
    const obj = {
      init: () => {
        wasm.init();
        return obj;
      },
      update: (data2) => {
        wasm.update(data2);
        return obj;
      },
      // biome-ignore lint/suspicious/noExplicitAny: Conflict with IHasher type
      digest: (outputType) => wasm.digest(outputType),
      save: () => wasm.save(),
      load: (data2) => {
        wasm.load(data2);
        return obj;
      },
      blockSize: 64,
      digestSize: 64
    };
    return obj;
  });
}
function sm3(data2) {
  if (wasmCache === null) {
    return lockedCreate(mutex, wasmJson, 32).then((wasm) => {
      wasmCache = wasm;
      return wasmCache.calculate(data2);
    });
  }
  try {
    const hash2 = wasmCache.calculate(data2);
    return Promise.resolve(hash2);
  } catch (err) {
    return Promise.reject(err);
  }
}
function createSM3() {
  return WASMInterface(wasmJson, 32).then((wasm) => {
    wasm.init();
    const obj = {
      init: () => {
        wasm.init();
        return obj;
      },
      update: (data2) => {
        wasm.update(data2);
        return obj;
      },
      // biome-ignore lint/suspicious/noExplicitAny: Conflict with IHasher type
      digest: (outputType) => wasm.digest(outputType),
      save: () => wasm.save(),
      load: (data2) => {
        wasm.load(data2);
        return obj;
      },
      blockSize: 64,
      digestSize: 32
    };
    return obj;
  });
}
var name$l, data$l, hash$l, wasmJson$l, Mutex, _a, globalObject, nodeBuffer, textEncoder, alpha, digit, getUInt8Buffer, base64Chars, base64Lookup, MAX_HEAP, WASM_FUNC_HASH_LENGTH, wasmMutex, wasmModuleCache, mutex$l, wasmCache$l, name$k, data$k, hash$k, wasmJson$k, name$j, data$j, hash$j, wasmJson$j, mutex$k, wasmCache$k, uint32View, validateOptions$3, getHashParameters, validateVerifyOptions$1, name$i, data$i, hash$i, wasmJson$i, mutex$j, wasmCache$j, name$h, data$h, hash$h, wasmJson$h, mutex$i, wasmCache$i, name$g, data$g, hash$g, wasmJson$g, mutex$h, wasmCache$h, name$f, data$f, hash$f, wasmJson$f, mutex$g, wasmCache$g, polyBuffer, name$e, data$e, hash$e, wasmJson$e, mutex$f, wasmCache$f, name$d, data$d, hash$d, wasmJson$d, mutex$e, wasmCache$e, name$c, data$c, hash$c, wasmJson$c, mutex$d, wasmCache$d, name$b, data$b, hash$b, wasmJson$b, mutex$c, wasmCache$c, mutex$b, wasmCache$b, name$a, data$a, hash$a, wasmJson$a, mutex$a, wasmCache$a, mutex$9, wasmCache$9, name$9, data$9, hash$9, wasmJson$9, mutex$8, wasmCache$8, mutex$7, wasmCache$7, name$8, data$8, hash$8, wasmJson$8, mutex$6, wasmCache$6, name$7, data$7, hash$7, wasmJson$7, mutex$5, wasmCache$5, seedBuffer$2, name$6, data$6, hash$6, wasmJson$6, mutex$4, wasmCache$4, seedBuffer$1, name$5, data$5, hash$5, wasmJson$5, mutex$3, wasmCache$3, seedBuffer, name$4, data$4, hash$4, wasmJson$4, mutex$2, wasmCache$2, validateOptions$2, name$3, data$3, hash$3, wasmJson$3, isPowerOfTwo, validateOptions$1, name$2, data$2, hash$2, wasmJson$2, validateOptions, validateHashCharacters, validateVerifyOptions, name$1, data$1, hash$1, wasmJson$1, mutex$1, wasmCache$1, name, data, hash, wasmJson, mutex, wasmCache;
var init_index_esm = __esm({
  "../../node_modules/hash-wasm/dist/index.esm.js"() {
    "use strict";
    name$l = "adler32";
    data$l = "AGFzbQEAAAABDANgAAF/YAAAYAF/AAMHBgABAgEAAgUEAQECAgYOAn8BQYCJBQt/AEGACAsHcAgGbWVtb3J5AgAOSGFzaF9HZXRCdWZmZXIAAAlIYXNoX0luaXQAAQtIYXNoX1VwZGF0ZQACCkhhc2hfRmluYWwAAw1IYXNoX0dldFN0YXRlAAQOSGFzaF9DYWxjdWxhdGUABQpTVEFURV9TSVpFAwEK6wkGBQBBgAkLCgBBAEEBNgKECAvjCAEHf0EAKAKECCIBQf//A3EhAiABQRB2IQMCQAJAIABBAUcNACACQQAtAIAJaiIBQY+AfGogASABQfD/A0sbIgEgA2oiBEEQdCIFQYCAPGogBSAEQfD/A0sbIAFyIQEMAQsCQAJAAkACQAJAIABBEEkNAEGACSEGIABBsCtJDQFBgAkhBgNAQQAhBQNAIAYgBWoiASgCACIEQf8BcSACaiICIANqIAIgBEEIdkH/AXFqIgJqIAIgBEEQdkH/AXFqIgJqIAIgBEEYdmoiAmogAiABQQRqKAIAIgRB/wFxaiICaiACIARBCHZB/wFxaiICaiACIARBEHZB/wFxaiICaiACIARBGHZqIgJqIAIgAUEIaigCACIEQf8BcWoiAmogAiAEQQh2Qf8BcWoiAmogAiAEQRB2Qf8BcWoiAmogAiAEQRh2aiIEaiAEIAFBDGooAgAiAUH/AXFqIgRqIAQgAUEIdkH/AXFqIgRqIAQgAUEQdkH/AXFqIgRqIAQgAUEYdmoiAmohAyAFQRBqIgVBsCtHDQALIANB8f8DcCEDIAJB8f8DcCECIAZBsCtqIQYgAEHQVGoiAEGvK0sNAAsgAEUNBCAAQQ9LDQEMAgsCQCAARQ0AAkACQCAAQQNxIgUNAEGACSEBIAAhBAwBCyAAQXxxIQRBACEBA0AgAiABQYAJai0AAGoiAiADaiEDIAUgAUEBaiIBRw0ACyAFQYAJaiEBCyAAQQRJDQADQCACIAEtAABqIgUgAS0AAWoiBiABLQACaiIAIAFBA2otAABqIgIgACAGIAUgA2pqamohAyABQQRqIQEgBEF8aiIEDQALCyACQY+AfGogAiACQfD/A0sbIANB8f8DcEEQdHIhAQwECwNAIAYoAgAiAUH/AXEgAmoiBCADaiAEIAFBCHZB/wFxaiIEaiAEIAFBEHZB/wFxaiIEaiAEIAFBGHZqIgRqIAQgBkEEaigCACIBQf8BcWoiBGogBCABQQh2Qf8BcWoiBGogBCABQRB2Qf8BcWoiBGogBCABQRh2aiIEaiAEIAZBCGooAgAiAUH/AXFqIgRqIAQgAUEIdkH/AXFqIgRqIAQgAUEQdkH/AXFqIgRqIAQgAUEYdmoiBGogBCAGQQxqKAIAIgFB/wFxaiIEaiAEIAFBCHZB/wFxaiIEaiAEIAFBEHZB/wFxaiIEaiAEIAFBGHZqIgJqIQMgBkEQaiEGIABBcGoiAEEPSw0ACyAARQ0BCyAAQX9qIQcCQCAAQQNxIgVFDQAgAEF8cSEAIAUhBCAGIQEDQCACIAEtAABqIgIgA2ohAyABQQFqIQEgBEF/aiIEDQALIAYgBWohBgsgB0EDSQ0AA0AgAiAGLQAAaiIBIAYtAAFqIgQgBi0AAmoiBSAGQQNqLQAAaiICIAUgBCABIANqampqIQMgBkEEaiEGIABBfGoiAA0ACwsgA0Hx/wNwIQMgAkHx/wNwIQILIAIgA0EQdHIhAQtBACABNgKECAsxAQF/QQBBACgChAgiAEEYdCAAQYD+A3FBCHRyIABBCHZBgP4DcSAAQRh2cnI2AoAJCwUAQYQICzsAQQBBATYChAggABACQQBBACgChAgiAEEYdCAAQYD+A3FBCHRyIABBCHZBgP4DcSAAQRh2cnI2AoAJCwsVAgBBgAgLBAQAAAAAQYQICwQBAAAA";
    hash$l = "02ddbd17";
    wasmJson$l = {
      name: name$l,
      data: data$l,
      hash: hash$l
    };
    Mutex = class {
      constructor() {
        this.mutex = Promise.resolve();
      }
      lock() {
        let begin = () => {
        };
        this.mutex = this.mutex.then(() => new Promise(begin));
        return new Promise((res) => {
          begin = res;
        });
      }
      dispatch(fn) {
        return __awaiter(this, void 0, void 0, function* () {
          const unlock = yield this.lock();
          try {
            return yield Promise.resolve(fn());
          } finally {
            unlock();
          }
        });
      }
    };
    globalObject = getGlobal();
    nodeBuffer = (_a = globalObject.Buffer) !== null && _a !== void 0 ? _a : null;
    textEncoder = globalObject.TextEncoder ? new globalObject.TextEncoder() : null;
    alpha = "a".charCodeAt(0) - 10;
    digit = "0".charCodeAt(0);
    getUInt8Buffer = nodeBuffer !== null ? (data2) => {
      if (typeof data2 === "string") {
        const buf = nodeBuffer.from(data2, "utf8");
        return new Uint8Array(buf.buffer, buf.byteOffset, buf.length);
      }
      if (nodeBuffer.isBuffer(data2)) {
        return new Uint8Array(data2.buffer, data2.byteOffset, data2.length);
      }
      if (ArrayBuffer.isView(data2)) {
        return new Uint8Array(data2.buffer, data2.byteOffset, data2.byteLength);
      }
      throw new Error("Invalid data type!");
    } : (data2) => {
      if (typeof data2 === "string") {
        return textEncoder.encode(data2);
      }
      if (ArrayBuffer.isView(data2)) {
        return new Uint8Array(data2.buffer, data2.byteOffset, data2.byteLength);
      }
      throw new Error("Invalid data type!");
    };
    base64Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    base64Lookup = new Uint8Array(256);
    for (let i = 0; i < base64Chars.length; i++) {
      base64Lookup[base64Chars.charCodeAt(i)] = i;
    }
    MAX_HEAP = 16 * 1024;
    WASM_FUNC_HASH_LENGTH = 4;
    wasmMutex = new Mutex();
    wasmModuleCache = /* @__PURE__ */ new Map();
    mutex$l = new Mutex();
    wasmCache$l = null;
    name$k = "argon2";
    data$k = "AGFzbQEAAAABKQVgAX8Bf2AAAX9gEH9/f39/f39/f39/f39/f38AYAR/f39/AGACf38AAwYFAAECAwQFBgEBAoCAAgYIAX8BQZCoBAsHQQQGbWVtb3J5AgASSGFzaF9TZXRNZW1vcnlTaXplAAAOSGFzaF9HZXRCdWZmZXIAAQ5IYXNoX0NhbGN1bGF0ZQAECvEyBVgBAn9BACEBAkAgAEEAKAKICCICRg0AAkAgACACayIAQRB2IABBgIB8cSAASWoiAEAAQX9HDQBB/wHADwtBACEBQQBBACkDiAggAEEQdK18NwOICAsgAcALcAECfwJAQQAoAoAIIgANAEEAPwBBEHQiADYCgAhBACgCiAgiAUGAgCBGDQACQEGAgCAgAWsiAEEQdiAAQYCAfHEgAElqIgBAAEF/Rw0AQQAPC0EAQQApA4gIIABBEHStfDcDiAhBACgCgAghAAsgAAvcDgECfiAAIAQpAwAiECAAKQMAIhF8IBFCAYZC/v///x+DIBBC/////w+DfnwiEDcDACAMIBAgDCkDAIVCIIkiEDcDACAIIBAgCCkDACIRfCARQgGGQv7///8fgyAQQv////8Pg358IhA3AwAgBCAQIAQpAwCFQiiJIhA3AwAgACAQIAApAwAiEXwgEEL/////D4MgEUIBhkL+////H4N+fCIQNwMAIAwgECAMKQMAhUIwiSIQNwMAIAggECAIKQMAIhF8IBBC/////w+DIBFCAYZC/v///x+DfnwiEDcDACAEIBAgBCkDAIVCAYk3AwAgASAFKQMAIhAgASkDACIRfCARQgGGQv7///8fgyAQQv////8Pg358IhA3AwAgDSAQIA0pAwCFQiCJIhA3AwAgCSAQIAkpAwAiEXwgEUIBhkL+////H4MgEEL/////D4N+fCIQNwMAIAUgECAFKQMAhUIoiSIQNwMAIAEgECABKQMAIhF8IBBC/////w+DIBFCAYZC/v///x+DfnwiEDcDACANIBAgDSkDAIVCMIkiEDcDACAJIBAgCSkDACIRfCAQQv////8PgyARQgGGQv7///8fg358IhA3AwAgBSAQIAUpAwCFQgGJNwMAIAIgBikDACIQIAIpAwAiEXwgEUIBhkL+////H4MgEEL/////D4N+fCIQNwMAIA4gECAOKQMAhUIgiSIQNwMAIAogECAKKQMAIhF8IBFCAYZC/v///x+DIBBC/////w+DfnwiEDcDACAGIBAgBikDAIVCKIkiEDcDACACIBAgAikDACIRfCAQQv////8PgyARQgGGQv7///8fg358IhA3AwAgDiAQIA4pAwCFQjCJIhA3AwAgCiAQIAopAwAiEXwgEEL/////D4MgEUIBhkL+////H4N+fCIQNwMAIAYgECAGKQMAhUIBiTcDACADIAcpAwAiECADKQMAIhF8IBFCAYZC/v///x+DIBBC/////w+DfnwiEDcDACAPIBAgDykDAIVCIIkiEDcDACALIBAgCykDACIRfCARQgGGQv7///8fgyAQQv////8Pg358IhA3AwAgByAQIAcpAwCFQiiJIhA3AwAgAyAQIAMpAwAiEXwgEEL/////D4MgEUIBhkL+////H4N+fCIQNwMAIA8gECAPKQMAhUIwiSIQNwMAIAsgECALKQMAIhF8IBBC/////w+DIBFCAYZC/v///x+DfnwiEDcDACAHIBAgBykDAIVCAYk3AwAgACAFKQMAIhAgACkDACIRfCARQgGGQv7///8fgyAQQv////8Pg358IhA3AwAgDyAQIA8pAwCFQiCJIhA3AwAgCiAQIAopAwAiEXwgEUIBhkL+////H4MgEEL/////D4N+fCIQNwMAIAUgECAFKQMAhUIoiSIQNwMAIAAgECAAKQMAIhF8IBBC/////w+DIBFCAYZC/v///x+DfnwiEDcDACAPIBAgDykDAIVCMIkiEDcDACAKIBAgCikDACIRfCAQQv////8PgyARQgGGQv7///8fg358IhA3AwAgBSAQIAUpAwCFQgGJNwMAIAEgBikDACIQIAEpAwAiEXwgEUIBhkL+////H4MgEEL/////D4N+fCIQNwMAIAwgECAMKQMAhUIgiSIQNwMAIAsgECALKQMAIhF8IBFCAYZC/v///x+DIBBC/////w+DfnwiEDcDACAGIBAgBikDAIVCKIkiEDcDACABIBAgASkDACIRfCAQQv////8PgyARQgGGQv7///8fg358IhA3AwAgDCAQIAwpAwCFQjCJIhA3AwAgCyAQIAspAwAiEXwgEEL/////D4MgEUIBhkL+////H4N+fCIQNwMAIAYgECAGKQMAhUIBiTcDACACIAcpAwAiECACKQMAIhF8IBFCAYZC/v///x+DIBBC/////w+DfnwiEDcDACANIBAgDSkDAIVCIIkiEDcDACAIIBAgCCkDACIRfCARQgGGQv7///8fgyAQQv////8Pg358IhA3AwAgByAQIAcpAwCFQiiJIhA3AwAgAiAQIAIpAwAiEXwgEEL/////D4MgEUIBhkL+////H4N+fCIQNwMAIA0gECANKQMAhUIwiSIQNwMAIAggECAIKQMAIhF8IBBC/////w+DIBFCAYZC/v///x+DfnwiEDcDACAHIBAgBykDAIVCAYk3AwAgAyAEKQMAIhAgAykDACIRfCARQgGGQv7///8fgyAQQv////8Pg358IhA3AwAgDiAQIA4pAwCFQiCJIhA3AwAgCSAQIAkpAwAiEXwgEUIBhkL+////H4MgEEL/////D4N+fCIQNwMAIAQgECAEKQMAhUIoiSIQNwMAIAMgECADKQMAIhF8IBBC/////w+DIBFCAYZC/v///x+DfnwiEDcDACAOIBAgDikDAIVCMIkiEDcDACAJIBAgCSkDACIRfCAQQv////8PgyARQgGGQv7///8fg358IhA3AwAgBCAQIAQpAwCFQgGJNwMAC98aAQN/QQAhBEEAIAIpAwAgASkDAIU3A5AIQQAgAikDCCABKQMIhTcDmAhBACACKQMQIAEpAxCFNwOgCEEAIAIpAxggASkDGIU3A6gIQQAgAikDICABKQMghTcDsAhBACACKQMoIAEpAyiFNwO4CEEAIAIpAzAgASkDMIU3A8AIQQAgAikDOCABKQM4hTcDyAhBACACKQNAIAEpA0CFNwPQCEEAIAIpA0ggASkDSIU3A9gIQQAgAikDUCABKQNQhTcD4AhBACACKQNYIAEpA1iFNwPoCEEAIAIpA2AgASkDYIU3A/AIQQAgAikDaCABKQNohTcD+AhBACACKQNwIAEpA3CFNwOACUEAIAIpA3ggASkDeIU3A4gJQQAgAikDgAEgASkDgAGFNwOQCUEAIAIpA4gBIAEpA4gBhTcDmAlBACACKQOQASABKQOQAYU3A6AJQQAgAikDmAEgASkDmAGFNwOoCUEAIAIpA6ABIAEpA6ABhTcDsAlBACACKQOoASABKQOoAYU3A7gJQQAgAikDsAEgASkDsAGFNwPACUEAIAIpA7gBIAEpA7gBhTcDyAlBACACKQPAASABKQPAAYU3A9AJQQAgAikDyAEgASkD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";
    hash$k = "e4cdc523";
    wasmJson$k = {
      name: name$k,
      data: data$k,
      hash: hash$k
    };
    name$j = "blake2b";
    data$j = "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";
    hash$j = "c6f286e6";
    wasmJson$j = {
      name: name$j,
      data: data$j,
      hash: hash$j
    };
    mutex$k = new Mutex();
    wasmCache$k = null;
    uint32View = new DataView(new ArrayBuffer(4));
    validateOptions$3 = (options) => {
      var _a2;
      if (!options || typeof options !== "object") {
        throw new Error("Invalid options parameter. It requires an object.");
      }
      if (!options.password) {
        throw new Error("Password must be specified");
      }
      options.password = getUInt8Buffer(options.password);
      if (options.password.length < 1) {
        throw new Error("Password must be specified");
      }
      if (!options.salt) {
        throw new Error("Salt must be specified");
      }
      options.salt = getUInt8Buffer(options.salt);
      if (options.salt.length < 8) {
        throw new Error("Salt should be at least 8 bytes long");
      }
      options.secret = getUInt8Buffer((_a2 = options.secret) !== null && _a2 !== void 0 ? _a2 : "");
      if (!Number.isInteger(options.iterations) || options.iterations < 1) {
        throw new Error("Iterations should be a positive number");
      }
      if (!Number.isInteger(options.parallelism) || options.parallelism < 1) {
        throw new Error("Parallelism should be a positive number");
      }
      if (!Number.isInteger(options.hashLength) || options.hashLength < 4) {
        throw new Error("Hash length should be at least 4 bytes.");
      }
      if (!Number.isInteger(options.memorySize)) {
        throw new Error("Memory size should be specified.");
      }
      if (options.memorySize < 8 * options.parallelism) {
        throw new Error("Memory size should be at least 8 * parallelism.");
      }
      if (options.outputType === void 0) {
        options.outputType = "hex";
      }
      if (!["hex", "binary", "encoded"].includes(options.outputType)) {
        throw new Error(`Insupported output type ${options.outputType}. Valid values: ['hex', 'binary', 'encoded']`);
      }
    };
    getHashParameters = (password, encoded, secret) => {
      const regex = /^\$argon2(id|i|d)\$v=([0-9]+)\$((?:[mtp]=[0-9]+,){2}[mtp]=[0-9]+)\$([A-Za-z0-9+/]+)\$([A-Za-z0-9+/]+)$/;
      const match = encoded.match(regex);
      if (!match) {
        throw new Error("Invalid hash");
      }
      const [, hashType, version2, parameters, salt, hash2] = match;
      if (version2 !== "19") {
        throw new Error(`Unsupported version: ${version2}`);
      }
      const parsedParameters = {};
      const paramMap = { m: "memorySize", p: "parallelism", t: "iterations" };
      for (const x of parameters.split(",")) {
        const [n, v] = x.split("=");
        parsedParameters[paramMap[n]] = Number(v);
      }
      return Object.assign(Object.assign({}, parsedParameters), {
        password,
        secret,
        hashType,
        salt: decodeBase64(salt),
        hashLength: getDecodeBase64Length(hash2),
        outputType: "encoded"
      });
    };
    validateVerifyOptions$1 = (options) => {
      if (!options || typeof options !== "object") {
        throw new Error("Invalid options parameter. It requires an object.");
      }
      if (options.hash === void 0 || typeof options.hash !== "string") {
        throw new Error("Hash should be specified");
      }
    };
    name$i = "blake2s";
    data$i = "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";
    hash$i = "5c0ff166";
    wasmJson$i = {
      name: name$i,
      data: data$i,
      hash: hash$i
    };
    mutex$j = new Mutex();
    wasmCache$j = null;
    name$h = "blake3";
    data$h = "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IQEgAkFAaiICQcAASw0ACwsCQEHAACAHQf8BcSIGayIFIAIgBSACSRsiCUUNACAJQQNxIQtBACEFAkAgCUEESQ0AIAAgBmohByAJQfwAcSEIQQAhBQNAIAcgBWoiAkEoaiABIAVqIgotAAA6AAAgAkEpaiAKQQFqLQAAOgAAIAJBKmogCkECai0AADoAACACQStqIApBA2otAAA6AAAgCCAFQQRqIgVHDQALCwJAIAtFDQAgASAFaiEBIAUgBmogAGpBKGohBQNAIAUgAS0AADoAACABQQFqIQEgBUEBaiEFIAtBf2oiCw0ACwsgAC0AaCEHCyAAIAcgCWo6AGggA0HAAGokAAveAwQFfwN+BX8GfiMAQdABayIBJAACQCAAe6ciAkEALQCQigEiA08NAEEALQCKigFBBHIhBCABQShqIQVBACkDmIkBIQBBACkDkIkBIQZBACkDiIkBIQdBACkDgIkBIQggAyEJA0AgASAANwMYIAEgBjcDECABIAc3AwggASAINwMAIAEgA0EFdCIDQdGJAWoiCikDADcDKCABIANB2YkBaiILKQMANwMwIAEgA0HhiQFqIgwpAwA3AzggASADQemJAWoiDSkDADcDQCABIANB8YkBaikDADcDSCABIANB+YkBaikDADcDUCABIANBgYoBaikDADcDWCADQYmKAWopAwAhDiABQcAAOgBoIAEgDjcDYCABQgA3AyAgASAEOgBpIAEgADcDiAEgASAGNwOAASABIAc3A3ggASAINwNwIAFBkAFqIAFB8ABqIAVBwABCACAEQf8BcRACIAEpA7ABIQ4gASkDkAEhDyABKQO4ASEQIAEpA5gBIREgASkDwAEhEiABKQOgASETIA0gASkDyAEgASkDqAGFNwMAIAwgEiAThTcDACALIBAgEYU3AwAgCiAOIA+FNwMAIAlBf2oiCUH/AXEiAyACSw0AC0EAIAk6AJCKAQsgAUHQAWokAAvHCQIKfwV+IwBB4AJrIgUkAAJAAkAgAUGACEsNACAFIAA2AvwBIAVB/AFqIAFBgAhGIgZBECACQQEgA0EBQQIgBBABIAZBCnQiByABTw0BIAVB4ABqIgZCADcDACAFQdgAaiIIQgA3AwAgBUHQAGoiCUIANwMAIAVByABqIgpCADcDACAFQcAAaiILQgA3AwAgBUE4aiIMQgA3AwAgBUEwaiINQgA3AwAgBSADOgBqIAVCADcDKCAFQQA7AWggBUEAKQOAiQE3AwAgBUEAKQOIiQE3AwggBUEAKQOQiQE3AxAgBUEAKQOYiQE3AxggBSABQYAIRiIOrSACfDcDICAFIAAgB2pBACABIA4bEAQgBUGIAWpBMGogDSkDADcDACAFQYgBakE4aiAMKQMANwMAIAUgBSkDACIPNwOIASAFIAUpAwgiEDcDkAEgBSAFKQMQIhE3A5gBIAUgBSkDGCISNwOgASAFIAUpAyg3A7ABIAUtAGohACAFLQBpIQcgBSkDICECIAUtAGghASAFQYgBakHAAGogCykDADcDACAFQYgBakHIAGogCikDADcDACAFQYgBakHQAGogCSkDADcDACAFQYgBakHYAGogCCkDADcDACAFQYgBakHgAGogBikDADcDACAFIAE6APABIAUgAjcDqAEgBSAAIAdFckECciIAOgDxASAFIBI3A5gCIAUgETcDkAIgBSAQNwOIAiAFIA83A4ACIAVBoAJqIAVBgAJqIAVBsAFqIAEgAiAAQf8BcRACIAUpA8ACIQIgBSkDoAIhDyAFKQPIAiEQIAUpA6gCIREgBSkD0AIhEiAFKQOwAiETIAQgDkEFdGoiASAFKQPYAiAFKQO4AoU3AxggASASIBOFNwMQIAEgECARhTcDCCABIAIgD4U3AwBBAkEBIA4bIQYMAQsgAEIBIAFBf2pBCnZBAXKteUI/hYYiD6dBCnQiDiACIAMgBRAGIQcgACAOaiABIA5rIA9C////AYMgAnwgAyAFQcAAQSAgDkGACEsbahAGIQECQCAHQQFHDQAgBCAFKQMANwMAIAQgBSkDCDcDCCAEIAUpAxA3AxAgBCAFKQMYNwMYIAQgBSkDIDcDICAEIAUpAyg3AyggBCAFKQMwNwMwIAQgBSkDODcDOEECIQYMAQtBACEGQQAhAAJAIAEgB2oiCUECSQ0AIAlBfmoiCkEBdkEBaiIGQQNxIQ5BACEHAkAgCkEGSQ0AIAZB/P///wdxIQhBACEHIAVBiAFqIQEgBSEAA0AgASAANgIAIAFBDGogAEHAAWo2AgAgAUEIaiAAQYABajYCACABQQRqIABBwABqNgIAIABBgAJqIQAgAUEQaiEBIAggB0EEaiIHRw0ACwsgCkF+cSEIAkAgDkUNACAFIAdBBnRqIQEgBUGIAWogB0ECdGohAANAIAAgATYCACABQcAAaiEBIABBBGohACAOQX9qIg4NAAsLIAhBAmohAAsgBUGIAWogBkEBQgBBACADQQRyQQBBACAEEAEgACAJTw0AIAQgBkEFdGoiASAFIAZBBnRqIgApAwA3AwAgASAAKQMINwMIIAEgACkDEDcDECABIAApAxg3AxggBkEBaiEGCyAFQeACaiQAIAYLrRAIAn8EfgF/AX4EfwR+BH8EfiMAQfABayIBJAACQCAARQ0AAkBBAC0AkIoBIgINACABQTBqQQApA9CJATcDACABQThqQQApA9iJATcDACABQQApA6CJASIDNwMAIAFBACkDqIkBIgQ3AwggAUEAKQOwiQEiBTcDECABQQApA7iJASIGNwMYIAFBACkDyIkBNwMoQQAtAIqKASECQQAtAImKASEHQQApA8CJASEIQQAtAIiKASEJIAFBwABqQQApA+CJATcDACABQcgAakEAKQPoiQE3AwAgAUHQAGpBACkD8IkBNwMAIAFB2ABqQQApA/iJATcDACABQeAAakEAKQOAigE3AwAgASAJOgBoIAEgCDcDICABIAIgB0VyIgJBAnI6AGkgAUEoaiEKQgAhCEGACSELIAJBCnJB/wFxIQwDQCABQbABaiABIAogCUH/AXEgCCAMEAIgASABKQPQASINIAEpA7ABhTcDcCABIAEpA9gBIg4gASkDuAGFNwN4IAEgASkD4AEiDyABKQPAAYU3A4ABIAEgASkD6AEiECAGhTcDqAEgASAPIAWFNwOgASABIA4gBIU3A5gBIAEgDSADhTcDkAEgASAQIAEpA8gBhTcDiAEgAEHAACAAQcAASRsiEUF/aiESAkACQCARQQdxIhMNACABQfAAaiECIAshByARIRQMAQsgEUH4AHEhFCABQfAAaiECIAshBwNAIAcgAi0AADoAACAHQQFqIQcgAkEBaiECIBNBf2oiEw0ACwsCQCASQQdJDQADQCAHIAIpAAA3AAAgB0EIaiEHIAJBCGohAiAUQXhqIhQNAAsLIAhCAXwhCCALIBFqIQsgACARayIADQAMAgsLAkACQAJAQQAtAImKASIHQQZ0QQBBAC0AiIoBIhFrRg0AIAEgEToAaCABQQApA4CKATcDYCABQQApA/iJATcDWCABQQApA/CJATcDUCABQQApA+iJATcDSCABQQApA+CJATcDQCABQQApA9iJATcDOCABQQApA9CJATcDMCABQQApA8iJATcDKCABQQApA8CJASIINwMgIAFBACkDuIkBIgM3AxggAUEAKQOwiQEiBDcDECABQQApA6iJASIFNwMIIAFBACkDoIkBIgY3AwAgAUEALQCKigEiEyAHRXJBAnIiCzoAaSATQQRyIRNBACkDmIkBIQ1BACkDkIkBIQ5BACkDiIkBIQ9BACkDgIkBIRAMAQtBwAAhESABQcAAOgBoQgAhCCABQgA3AyAgAUEAKQOYiQEiDTcDGCABQQApA5CJASIONwMQIAFBACkDiIkBIg83AwggAUEAKQOAiQEiEDcDACABQQAtAIqKAUEEciITOgBpIAEgAkF+aiICQQV0IgdByYoBaikDADcDYCABIAdBwYoBaikDADcDWCABIAdBuYoBaikDADcDUCABIAdBsYoBaikDADcDSCABIAdBqYoBaikDADcDQCABIAdBoYoBaikDADcDOCABIAdBmYoBaikDADcDMCABIAdBkYoBaikDADcDKCATIQsgECEGIA8hBSAOIQQgDSEDIAJFDQELIAJBf2oiB0EFdCIUQZGKAWopAwAhFSAUQZmKAWopAwAhFiAUQaGKAWopAwAhFyAUQamKAWopAwAhGCABIAM3A4gBIAEgBDcDgAEgASAFNwN4IAEgBjcDcCABQbABaiABQfAAaiABQShqIhQgESAIIAtB/wFxEAIgASATOgBpIAFBwAA6AGggASAYNwNAIAEgFzcDOCABIBY3AzAgASAVNwMoIAFCADcDICABIA03AxggASAONwMQIAEgDzcDCCABIBA3AwAgASABKQPoASABKQPIAYU3A2AgASABKQPgASABKQPAAYU3A1ggASABKQPYASABKQO4AYU3A1AgASABKQPQASABKQOwAYU3A0ggB0UNACACQQV0QemJAWohAiATQf8BcSERA0AgAkFoaikDACEIIAJBcGopAwAhAyACQXhqKQMAIQQgAikDACEFIAEgDTcDiAEgASAONwOAASABIA83A3ggASAQNwNwIAFBsAFqIAFB8ABqIBRBwABCACAREAIgASATOgBpIAFBwAA6AGggASAFNwNAIAEgBDcDOCABIAM3AzAgASAINwMoIAFCADcDICABIA03AxggASAONwMQIAEgDzcDCCABIBA3AwAgASABKQPoASABKQPIAYU3A2AgASABKQPgASABKQPAAYU3A1ggASABKQPYASABKQO4AYU3A1AgASABKQPQASABKQOwAYU3A0ggAkFgaiECIAdBf2oiBw0ACwsgAUEoaiEJQgAhCEGACSELIBNBCHJB/wFxIQoDQCABQbABaiABIAlBwAAgCCAKEAIgASABKQPQASIDIAEpA7ABhTcDcCABIAEpA9gBIgQgASkDuAGFNwN4IAEgASkD4AEiBSABKQPAAYU3A4ABIAEgDSABKQPoASIGhTcDqAEgASAOIAWFNwOgASABIA8gBIU3A5gBIAEgECADhTcDkAEgASAGIAEpA8gBhTcDiAEgAEHAACAAQcAASRsiEUF/aiESAkACQCARQQdxIhMNACABQfAAaiECIAshByARIRQMAQsgEUH4AHEhFCABQfAAaiECIAshBwNAIAcgAi0AADoAACAHQQFqIQcgAkEBaiECIBNBf2oiEw0ACwsCQCASQQdJDQADQCAHIAIpAAA3AAAgB0EIaiEHIAJBCGohAiAUQXhqIhQNAAsLIAhCAXwhCCALIBFqIQsgACARayIADQALCyABQfABaiQAC6MCAQR+AkACQCAAQSBGDQBCq7OP/JGjs/DbACEBQv+kuYjFkdqCm38hAkLy5rvjo6f9p6V/IQNC58yn0NbQ67O7fyEEQQAhAAwBC0EAKQOYCSEBQQApA5AJIQJBACkDiAkhA0EAKQOACSEEQRAhAAtBACAAOgCKigFBAEIANwOAigFBAEIANwP4iQFBAEIANwPwiQFBAEIANwPoiQFBAEIANwPgiQFBAEIANwPYiQFBAEIANwPQiQFBAEIANwPIiQFBAEIANwPAiQFBACABNwO4iQFBACACNwOwiQFBACADNwOoiQFBACAENwOgiQFBACABNwOYiQFBACACNwOQiQFBACADNwOIiQFBACAENwOAiQFBAEEAOgCQigFBAEEAOwGIigELBgAgABADCwYAIAAQBwsGAEGAiQELqwIBBH4CQAJAIAFBIEYNAEKrs4/8kaOz8NsAIQNC/6S5iMWR2oKbfyEEQvLmu+Ojp/2npX8hBULnzKfQ1tDrs7t/IQZBACEBDAELQQApA5gJIQNBACkDkAkhBEEAKQOICSEFQQApA4AJIQZBECEBC0EAIAE6AIqKAUEAQgA3A4CKAUEAQgA3A/iJAUEAQgA3A/CJAUEAQgA3A+iJAUEAQgA3A+CJAUEAQgA3A9iJAUEAQgA3A9CJAUEAQgA3A8iJAUEAQgA3A8CJAUEAIAM3A7iJAUEAIAQ3A7CJAUEAIAU3A6iJAUEAIAY3A6CJAUEAIAM3A5iJAUEAIAQ3A5CJAUEAIAU3A4iJAUEAIAY3A4CJAUEAQQA6AJCKAUEAQQA7AYiKASAAEAMgAhAHCwsLAQBBgAgLBHgHAAA=";
    hash$h = "215d875f";
    wasmJson$h = {
      name: name$h,
      data: data$h,
      hash: hash$h
    };
    mutex$i = new Mutex();
    wasmCache$i = null;
    name$g = "crc32";
    data$g = "AGFzbQEAAAABEQRgAAF/YAF/AGAAAGACf38AAwgHAAEBAQIAAwUEAQECAgYOAn8BQZDJBQt/AEGACAsHcAgGbWVtb3J5AgAOSGFzaF9HZXRCdWZmZXIAAAlIYXNoX0luaXQAAgtIYXNoX1VwZGF0ZQADCkhhc2hfRmluYWwABA1IYXNoX0dldFN0YXRlAAUOSGFzaF9DYWxjdWxhdGUABgpTVEFURV9TSVpFAwEKkggHBQBBgAkLwwMBA39BgIkBIQFBACECA0AgAUEAQQBBAEEAQQBBAEEAQQAgAkEBcWsgAHEgAkEBdnMiA0EBcWsgAHEgA0EBdnMiA0EBcWsgAHEgA0EBdnMiA0EBcWsgAHEgA0EBdnMiA0EBcWsgAHEgA0EBdnMiA0EBcWsgAHEgA0EBdnMiA0EBcWsgAHEgA0EBdnMiA0EBcWsgAHEgA0EBdnM2AgAgAUEEaiEBIAJBAWoiAkGAAkcNAAtBACEAA0AgAEGEkQFqIABBhIkBaigCACICQf8BcUECdEGAiQFqKAIAIAJBCHZzIgI2AgAgAEGEmQFqIAJB/wFxQQJ0QYCJAWooAgAgAkEIdnMiAjYCACAAQYShAWogAkH/AXFBAnRBgIkBaigCACACQQh2cyICNgIAIABBhKkBaiACQf8BcUECdEGAiQFqKAIAIAJBCHZzIgI2AgAgAEGEsQFqIAJB/wFxQQJ0QYCJAWooAgAgAkEIdnMiAjYCACAAQYS5AWogAkH/AXFBAnRBgIkBaigCACACQQh2cyICNgIAIABBhMEBaiACQf8BcUECdEGAiQFqKAIAIAJBCHZzNgIAIABBBGoiAEH8B0cNAAsLJwACQEEAKAKAyQEgAEYNACAAEAFBACAANgKAyQELQQBBADYChMkBC4gDAQN/QQAoAoTJAUF/cyEBQYAJIQICQCAAQQhJDQBBgAkhAgNAIAJBBGooAgAiA0EOdkH8B3FBgJEBaigCACADQRZ2QfwHcUGAiQFqKAIAcyADQQZ2QfwHcUGAmQFqKAIAcyADQf8BcUECdEGAoQFqKAIAcyACKAIAIAFzIgFBFnZB/AdxQYCpAWooAgBzIAFBDnZB/AdxQYCxAWooAgBzIAFBBnZB/AdxQYC5AWooAgBzIAFB/wFxQQJ0QYDBAWooAgBzIQEgAkEIaiECIABBeGoiAEEHSw0ACwsCQCAARQ0AAkACQCAAQQFxDQAgACEDDAELIAFB/wFxIAItAABzQQJ0QYCJAWooAgAgAUEIdnMhASACQQFqIQIgAEF/aiEDCyAAQQFGDQADQCABQf8BcSACLQAAc0ECdEGAiQFqKAIAIAFBCHZzIgFB/wFxIAJBAWotAABzQQJ0QYCJAWooAgAgAUEIdnMhASACQQJqIQIgA0F+aiIDDQALC0EAIAFBf3M2AoTJAQsyAQF/QQBBACgChMkBIgBBGHQgAEGA/gNxQQh0ciAAQQh2QYD+A3EgAEEYdnJyNgKACQsGAEGEyQELWQACQEEAKAKAyQEgAUYNACABEAFBACABNgKAyQELQQBBADYChMkBIAAQA0EAQQAoAoTJASIBQRh0IAFBgP4DcUEIdHIgAUEIdkGA/gNxIAFBGHZycjYCgAkLCwsBAEGACAsEBAAAAA==";
    hash$g = "d2eba587";
    wasmJson$g = {
      name: name$g,
      data: data$g,
      hash: hash$g
    };
    mutex$h = new Mutex();
    wasmCache$h = null;
    name$f = "crc64";
    data$f = "AGFzbQEAAAABDANgAAF/YAAAYAF/AAMHBgABAgEAAQUEAQECAgYOAn8BQZCJBgt/AEGACAsHcAgGbWVtb3J5AgAOSGFzaF9HZXRCdWZmZXIAAAlIYXNoX0luaXQAAQtIYXNoX1VwZGF0ZQACCkhhc2hfRmluYWwAAw1IYXNoX0dldFN0YXRlAAQOSGFzaF9DYWxjdWxhdGUABQpTVEFURV9TSVpFAwEKgwgGBQBBgAkL9QMDAX4BfwJ+AkBBACkDgIkCQQApA4AJIgBRDQBBgIkBIQFCACECA0AgAUIAQgBCAEIAQgBCAEIAQgAgAkIBg30gAIMgAkIBiIUiA0IBg30gAIMgA0IBiIUiA0IBg30gAIMgA0IBiIUiA0IBg30gAIMgA0IBiIUiA0IBg30gAIMgA0IBiIUiA0IBg30gAIMgA0IBiIUiA0IBg30gAIMgA0IBiIUiA0IBg30gAIMgA0IBiIU3AwAgAUEIaiEBIAJCAXwiAkKAAlINAAtBACEBA0AgAUGImQFqIAFBiIkBaikDACICp0H/AXFBA3RBgIkBaikDACACQgiIhSICNwMAIAFBiKkBaiACp0H/AXFBA3RBgIkBaikDACACQgiIhSICNwMAIAFBiLkBaiACp0H/AXFBA3RBgIkBaikDACACQgiIhSICNwMAIAFBiMkBaiACp0H/AXFBA3RBgIkBaikDACACQgiIhSICNwMAIAFBiNkBaiACp0H/AXFBA3RBgIkBaikDACACQgiIhSICNwMAIAFBiOkBaiACp0H/AXFBA3RBgIkBaikDACACQgiIhSICNwMAIAFBiPkBaiACp0H/AXFBA3RBgIkBaikDACACQgiIhTcDACABQQhqIgFB+A9HDQALQQAgADcDgIkCC0EAQgA3A4iJAguUAwIBfgJ/QQApA4iJAkJ/hSEBQYAJIQICQCAAQQhJDQBBgAkhAgNAIAIpAwAgAYUiAUIwiKdB/wFxQQN0QYCZAWopAwAgAUI4iKdBA3RBgIkBaikDAIUgAUIoiKdB/wFxQQN0QYCpAWopAwCFIAFCIIinQf8BcUEDdEGAuQFqKQMAhSABpyIDQRV2QfgPcUGAyQFqKQMAhSADQQ12QfgPcUGA2QFqKQMAhSADQQV2QfgPcUGA6QFqKQMAhSADQf8BcUEDdEGA+QFqKQMAhSEBIAJBCGohAiAAQXhqIgBBB0sNAAsLAkAgAEUNAAJAAkAgAEEBcQ0AIAAhAwwBCyABQv8BgyACMQAAhadBA3RBgIkBaikDACABQgiIhSEBIAJBAWohAiAAQX9qIQMLIABBAUYNAANAIAFC/wGDIAIxAACFp0EDdEGAiQFqKQMAIAFCCIiFIgFC/wGDIAJBAWoxAACFp0EDdEGAiQFqKQMAIAFCCIiFIQEgAkECaiECIANBfmoiAw0ACwtBACABQn+FNwOIiQILZAEBfkEAQQApA4iJAiIAQjiGIABCgP4Dg0IohoQgAEKAgPwHg0IYhiAAQoCAgPgPg0IIhoSEIABCCIhCgICA+A+DIABCGIhCgID8B4OEIABCKIhCgP4DgyAAQjiIhISENwOACQsGAEGIiQILAgALCwsBAEGACAsECAAAAA==";
    hash$f = "c5ac6c16";
    wasmJson$f = {
      name: name$f,
      data: data$f,
      hash: hash$f
    };
    mutex$g = new Mutex();
    wasmCache$g = null;
    polyBuffer = new Uint8Array(8);
    name$e = "md4";
    data$e = "AGFzbQEAAAABEgRgAAF/YAAAYAF/AGACf38BfwMIBwABAgMBAAIFBAEBAgIGDgJ/AUGgigULfwBBgAgLB3AIBm1lbW9yeQIADkhhc2hfR2V0QnVmZmVyAAAJSGFzaF9Jbml0AAELSGFzaF9VcGRhdGUAAgpIYXNoX0ZpbmFsAAQNSGFzaF9HZXRTdGF0ZQAFDkhhc2hfQ2FsY3VsYXRlAAYKU1RBVEVfU0laRQMBCucUBwUAQYAJCy0AQQBC/rnrxemOlZkQNwKQiQFBAEKBxpS6lvHq5m83AoiJAUEAQgA3AoCJAQu+BQEHf0EAQQAoAoCJASIBIABqQf////8BcSICNgKAiQFBAEEAKAKEiQEgAiABSWogAEEddmo2AoSJAQJAAkACQAJAAkACQCABQT9xIgMNAEGACSEEDAELIABBwAAgA2siBUkNASAFQQNxIQZBACEBAkAgA0E/c0EDSQ0AIANBgIkBaiEEIAVB/ABxIQdBACEBA0AgBCABaiICQRhqIAFBgAlqLQAAOgAAIAJBGWogAUGBCWotAAA6AAAgAkEaaiABQYIJai0AADoAACACQRtqIAFBgwlqLQAAOgAAIAcgAUEEaiIBRw0ACwsCQCAGRQ0AIANBmIkBaiECA0AgAiABaiABQYAJai0AADoAACABQQFqIQEgBkF/aiIGDQALC0GYiQFBwAAQAxogACAFayEAIAVBgAlqIQQLIABBwABPDQEgACECDAILIABFDQIgAEEDcSEGQQAhAQJAIABBBEkNACADQYCJAWohBCAAQXxxIQBBACEBA0AgBCABaiICQRhqIAFBgAlqLQAAOgAAIAJBGWogAUGBCWotAAA6AAAgAkEaaiABQYIJai0AADoAACACQRtqIAFBgwlqLQAAOgAAIAAgAUEEaiIBRw0ACwsgBkUNAiADQZiJAWohAgNAIAIgAWogAUGACWotAAA6AAAgAUEBaiEBIAZBf2oiBg0ADAMLCyAAQT9xIQIgBCAAQUBxEAMhBAsgAkUNACACQQNxIQZBACEBAkAgAkEESQ0AIAJBPHEhAEEAIQEDQCABQZiJAWogBCABaiICLQAAOgAAIAFBmYkBaiACQQFqLQAAOgAAIAFBmokBaiACQQJqLQAAOgAAIAFBm4kBaiACQQNqLQAAOgAAIAAgAUEEaiIBRw0ACwsgBkUNAANAIAFBmIkBaiAEIAFqLQAAOgAAIAFBAWohASAGQX9qIgYNAAsLC+sKARd/QQAoApSJASECQQAoApCJASEDQQAoAoyJASEEQQAoAoiJASEFA0AgACgCHCIGIAAoAhQiByAAKAIYIgggACgCECIJIAAoAiwiCiAAKAIoIgsgACgCJCIMIAAoAiAiDSALIAggACgCCCIOIANqIAAoAgQiDyACaiAEIAMgAnNxIAJzIAVqIAAoAgAiEGpBA3ciESAEIANzcSADc2pBB3ciEiARIARzcSAEc2pBC3ciE2ogEiAHaiAJIBFqIAAoAgwiFCAEaiATIBIgEXNxIBFzakETdyIRIBMgEnNxIBJzakEDdyISIBEgE3NxIBNzakEHdyITIBIgEXNxIBFzakELdyIVaiATIAxqIBIgDWogESAGaiAVIBMgEnNxIBJzakETdyIRIBUgE3NxIBNzakEDdyISIBEgFXNxIBVzakEHdyITIBIgEXNxIBFzakELdyIVIAAoAjgiFmogEyAAKAI0IhdqIBIgACgCMCIYaiARIApqIBUgEyASc3EgEnNqQRN3IhIgFSATc3EgE3NqQQN3IhMgEiAVc3EgFXNqQQd3IhUgEyASc3EgEnNqQQt3IhFqIAkgFWogECATaiASIAAoAjwiCWogESAVIBNzcSATc2pBE3ciEiARIBVycSARIBVxcmpBmfOJ1AVqQQN3IhMgEiARcnEgEiARcXJqQZnzidQFakEFdyIRIBMgEnJxIBMgEnFyakGZ84nUBWpBCXciFWogByARaiAPIBNqIBggEmogFSARIBNycSARIBNxcmpBmfOJ1AVqQQ13IhIgFSARcnEgFSARcXJqQZnzidQFakEDdyIRIBIgFXJxIBIgFXFyakGZ84nUBWpBBXciEyARIBJycSARIBJxcmpBmfOJ1AVqQQl3IhVqIAggE2ogDiARaiAXIBJqIBUgEyARcnEgEyARcXJqQZnzidQFakENdyIRIBUgE3JxIBUgE3FyakGZ84nUBWpBA3ciEiARIBVycSARIBVxcmpBmfOJ1AVqQQV3IhMgEiARcnEgEiARcXJqQZnzidQFakEJdyIVaiAGIBNqIBQgEmogFiARaiAVIBMgEnJxIBMgEnFyakGZ84nUBWpBDXciESAVIBNycSAVIBNxcmpBmfOJ1AVqQQN3IhIgESAVcnEgESAVcXJqQZnzidQFakEFdyITIBIgEXJxIBIgEXFyakGZ84nUBWpBCXciFWogECASaiAJIBFqIBUgEyAScnEgEyAScXJqQZnzidQFakENdyIGIBVzIhIgE3NqQaHX5/YGakEDdyIRIAZzIA0gE2ogEiARc2pBodfn9gZqQQl3IhJzakGh1+f2BmpBC3ciE2ogDiARaiATIBJzIBggBmogEiARcyATc2pBodfn9gZqQQ93IhFzakGh1+f2BmpBA3ciFSARcyALIBJqIBEgE3MgFXNqQaHX5/YGakEJdyISc2pBodfn9gZqQQt3IhNqIA8gFWogEyAScyAWIBFqIBIgFXMgE3NqQaHX5/YGakEPdyIRc2pBodfn9gZqQQN3IhUgEXMgDCASaiARIBNzIBVzakGh1+f2BmpBCXciEnNqQaHX5/YGakELdyITaiAUIBVqIBMgEnMgFyARaiASIBVzIBNzakGh1+f2BmpBD3ciEXNqQaHX5/YGakEDdyIVIBFzIAogEmogESATcyAVc2pBodfn9gZqQQl3IhJzakGh1+f2BmpBC3ciEyADaiEDIAkgEWogEiAVcyATc2pBodfn9gZqQQ93IARqIQQgEiACaiECIBUgBWohBSAAQcAAaiEAIAFBQGoiAQ0AC0EAIAI2ApSJAUEAIAM2ApCJAUEAIAQ2AoyJAUEAIAU2AoiJASAAC8gDAQV/QQAoAoCJAUE/cSIAQZiJAWpBgAE6AAAgAEEBaiEBAkACQAJAAkAgAEE/cyICQQdLDQAgAkUNASABQZiJAWpBADoAACACQQFGDQEgAEGaiQFqQQA6AAAgAkECRg0BIABBm4kBakEAOgAAIAJBA0YNASAAQZyJAWpBADoAACACQQRGDQEgAEGdiQFqQQA6AAAgAkEFRg0BIABBnokBakEAOgAAIAJBBkYNASAAQZ+JAWpBADoAAAwBCyACQQhGDQJBNiAAayIDIQQCQCACQQNxIgBFDQBBACAAayEEQQAhAANAIABBz4kBakEAOgAAIAQgAEF/aiIARw0ACyADIABqIQQLIANBA0kNAgwBC0GYiQFBwAAQAxpBACEBQTchBAsgAUGAiQFqIQBBfyECA0AgACAEakEVakEANgAAIABBfGohACAEIAJBBGoiAkcNAAsLQQBBACgChIkBNgLUiQFBAEEAKAKAiQEiAEEVdjoA04kBQQAgAEENdjoA0okBQQAgAEEFdjoA0YkBQQAgAEEDdCIAOgDQiQFBACAANgKAiQFBmIkBQcAAEAMaQQBBACkCiIkBNwOACUEAQQApApCJATcDiAkLBgBBgIkBCzMAQQBC/rnrxemOlZkQNwKQiQFBAEKBxpS6lvHq5m83AoiJAUEAQgA3AoCJASAAEAIQBAsLCwEAQYAICwSYAAAA";
    hash$e = "bd8ce7c7";
    wasmJson$e = {
      name: name$e,
      data: data$e,
      hash: hash$e
    };
    mutex$f = new Mutex();
    wasmCache$f = null;
    name$d = "md5";
    data$d = "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";
    hash$d = "e6508e4b";
    wasmJson$d = {
      name: name$d,
      data: data$d,
      hash: hash$d
    };
    mutex$e = new Mutex();
    wasmCache$e = null;
    name$c = "sha1";
    data$c = "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";
    hash$c = "6b530c24";
    wasmJson$c = {
      name: name$c,
      data: data$c,
      hash: hash$c
    };
    mutex$d = new Mutex();
    wasmCache$d = null;
    name$b = "sha3";
    data$b = "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";
    hash$b = "fb24e536";
    wasmJson$b = {
      name: name$b,
      data: data$b,
      hash: hash$b
    };
    mutex$c = new Mutex();
    wasmCache$c = null;
    mutex$b = new Mutex();
    wasmCache$b = null;
    name$a = "sha256";
    data$a = "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c2pBx6KerX1qIhkgASADcyACcSABIANxcyABQR53IAFBE3dzIAFBCndzaiAaaiICaiIJIBMgEnNxIBJzaiAJQRp3IAlBFXdzIAlBB3dzakHRxqk2aiIaIAIgAXMgA3EgAiABcXMgAkEedyACQRN3cyACQQp3c2ogGGoiA2oiESAJIBNzcSATc2ogEUEadyARQRV3cyARQQd3c2pB59KkoQFqIhggAyACcyABcSADIAJxcyADQR53IANBE3dzIANBCndzaiAUaiIBaiISIBEgCXNxIAlzaiASQRp3IBJBFXdzIBJBB3dzakGFldy9AmoiFCABIANzIAJxIAEgA3FzIAFBHncgAUETd3MgAUEKd3NqIBdqIgJqIhMgI2ogJiASaiAiIBFqICUgCWogEyASIBFzcSARc2ogE0EadyATQRV3cyATQQd3c2pBuMLs8AJqIhcgAiABcyADcSACIAFxcyACQR53IAJBE3dzIAJBCndzaiAZaiIDaiIJIBMgEnNxIBJzaiAJQRp3IAlBFXdzIAlBB3dzakH827HpBGoiGSADIAJzIAFxIAMgAnFzIANBHncgA0ETd3MgA0EKd3NqIBpqIgFqIhEgCSATc3EgE3NqIBFBGncgEUEVd3MgEUEHd3NqQZOa4JkFaiIaIAEgA3MgAnEgASADcXMgAUEedyABQRN3cyABQQp3c2ogGGoiAmoiEiARIAlzcSAJc2ogEkEadyASQRV3cyASQQd3c2pB1OapqAZqIhggAiABcyADcSACIAFxcyACQR53IAJBE3dzIAJBCndzaiAUaiIDaiITaiAoIBJqICQgEWogJyAJaiATIBIgEXNxIBFzaiATQRp3IBNBFXdzIBNBB3dzakG7laizB2oiFCADIAJzIAFxIAMgAnFzIANBHncgA0ETd3MgA0EKd3NqIBdqIgFqIgkgEyASc3EgEnNqIAlBGncgCUEVd3MgCUEHd3NqQa6Si454aiIXIAEgA3MgAnEgASADcXMgAUEedyABQRN3cyABQQp3c2ogGWoiAmoiESAJIBNzcSATc2ogEUEadyARQRV3cyARQQd3c2pBhdnIk3lqIhkgAiABcyADcSACIAFxcyACQR53IAJBE3dzIAJBCndzaiAaaiIDaiISIBEgCXNxIAlzaiASQRp3IBJBFXdzIBJBB3dzakGh0f+VemoiGiADIAJz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";
    hash$a = "8c18dd94";
    wasmJson$a = {
      name: name$a,
      data: data$a,
      hash: hash$a
    };
    mutex$a = new Mutex();
    wasmCache$a = null;
    mutex$9 = new Mutex();
    wasmCache$9 = null;
    name$9 = "sha512";
    data$9 = "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";
    hash$9 = "f2e40eb1";
    wasmJson$9 = {
      name: name$9,
      data: data$9,
      hash: hash$9
    };
    mutex$8 = new Mutex();
    wasmCache$8 = null;
    mutex$7 = new Mutex();
    wasmCache$7 = null;
    name$8 = "xxhash32";
    data$8 = "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";
    hash$8 = "4bb12485";
    wasmJson$8 = {
      name: name$8,
      data: data$8,
      hash: hash$8
    };
    mutex$6 = new Mutex();
    wasmCache$6 = null;
    name$7 = "xxhash64";
    data$7 = "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";
    hash$7 = "177fbfa3";
    wasmJson$7 = {
      name: name$7,
      data: data$7,
      hash: hash$7
    };
    mutex$5 = new Mutex();
    wasmCache$5 = null;
    seedBuffer$2 = new Uint8Array(8);
    name$6 = "xxhash3";
    data$6 = "AGFzbQEAAAABNAhgAAF/YAR/f39/AGAHf39/f39/fwBgBH9+fn4BfmAEf39/fgF+YAN/f34BfmAAAGABfwADDg0AAQIDBAUFBQYHBgAGBQQBAQICBg4CfwFBwI4FC38AQcAJCwdwCAZtZW1vcnkCAA5IYXNoX0dldEJ1ZmZlcgAACUhhc2hfSW5pdAAIC0hhc2hfVXBkYXRlAAkKSGFzaF9GaW5hbAAKDUhhc2hfR2V0U3RhdGUACw5IYXNoX0NhbGN1bGF0ZQAMClNUQVRFX1NJWkUDAQr6QQ0FAEGACgvkAwMPfgF/AX4CQCADRQ0AIAApAzAhBCAAKQM4IQUgACkDICEGIAApAyghByAAKQMQIQggACkDGCEJIAApAwAhCiAAKQMIIQsDQCAFIAFBMGopAwAiDHwgAkE4aikDACABQThqKQMAIg2FIgVCIIggBUL/////D4N+fCEFIAcgAUEgaikDACIOfCACQShqKQMAIAFBKGopAwAiD4UiB0IgiCAHQv////8Pg358IQcgCSABQRBqKQMAIhB8IAJBGGopAwAgAUEYaikDACIRhSIJQiCIIAlC/////w+DfnwhCSALIAEpAwAiEnwgAkEIaiITKQMAIAFBCGopAwAiFIUiC0IgiCALQv////8Pg358IQsgAkEwaikDACAMhSIMQiCIIAxC/////w+DfiAEfCANfCEEIAJBIGopAwAgDoUiDEIgiCAMQv////8Pg34gBnwgD3whBiACQRBqKQMAIBCFIgxCIIggDEL/////D4N+IAh8IBF8IQggAikDACAShSIMQiCIIAxC/////w+DfiAKfCAUfCEKIAFBwABqIQEgEyECIANBf2oiAw0ACyAAIAk3AxggACAKNwMAIAAgCzcDCCAAIAc3AyggACAINwMQIAAgBTcDOCAAIAY3AyAgACAENwMwCwveAgIBfwF+AkAgBCACIAEoAgAiB2siAkkNACAAIAMgBSAHQQN0aiACEAEgACAFIAZqIgcpAwAgACkDACIIQi+IhSAIhUKx893xCX43AwAgACAHKQMIIAApAwgiCEIviIUgCIVCsfPd8Ql+NwMIIAAgBykDECAAKQMQIghCL4iFIAiFQrHz3fEJfjcDECAAIAcpAxggACkDGCIIQi+IhSAIhUKx893xCX43AxggACAHKQMgIAApAyAiCEIviIUgCIVCsfPd8Ql+NwMgIAAgBykDKCAAKQMoIghCL4iFIAiFQrHz3fEJfjcDKCAAIAcpAzAgACkDMCIIQi+IhSAIhUKx893xCX43AzAgACAHKQM4IAApAzgiCEIviIUgCIVCsfPd8Ql+NwM4IAAgAyACQQZ0aiAFIAQgAmsiBxABIAEgBzYCAA8LIAAgAyAFIAdBA3RqIAQQASABIAcgBGo2AgALhQEBAX8gAiABhSADpyIEQRh0IARBgP4DcUEIdHIgBEEIdkGA/gNxIARBGHZycq1CIIYgA4V9QQA1AoCMAUIghiAAQfyLAWo1AgCEhSIDQjGJIANCGImFIAOFQqW+4/TRjIfZn39+IgNCI4ggAK18IAOFQqW+4/TRjIfZn39+IgNCHIggA4ULZwAgAiABc60gA3wiA0IhiEEALQCAjAFBEHQgAEEIdHIgAEEBdkGAjAFqLQAAQRh0ciAAQf+LAWotAAByrYUgA4VCz9bTvtLHq9lCfiIDQh2IIAOFQvnz3fGZ9pmrFn4iA0IgiCADhQuJAwEEfgJAIABBCUkNAEEAKQOAjAEgASkDICABKQMYhSACfIUiA0I4hiADQoD+A4NCKIaEIANCgID8B4NCGIYgA0KAgID4D4NCCIaEhCADQgiIQoCAgPgPgyADQhiIQoCA/AeDhCADQiiIQoD+A4MgA0I4iISEhCAArXwgAEH4iwFqKQMAIAEpAzAgASkDKIUgAn2FIgJ8IAJC/////w+DIgQgA0IgiCIFfiIGQv////8PgyACQiCIIgIgA0L/////D4MiA358IAQgA34iA0IgiHwiBEIghiADQv////8Pg4QgBkIgiCACIAV+fCAEQiCIfIV8IgNCJYggA4VC+fPd8ZnymasWfiIDQiCIIAOFDwsCQCAAQQRJDQAgACABQQhqKQMAIAFBEGopAwAgAhADDwsCQCAARQ0AIAAgASgCACABQQRqKAIAIAIQBA8LIAEpAzggASkDQIUgAoUiA0IhiCADhULP1tO+0ser2UJ+IgNCHYggA4VC+fPd8Zn2masWfiIDQiCIIAOFC94IAQZ+IACtQoeVr6+Ytt6bnn9+IQMCQCAAQSFJDQACQCAAQcEASQ0AAkAgAEHhAEkNACABKQNoIAJ9QQApA7iMAYUiBEL/////D4MiBSABKQNgIAJ8QQApA7CMAYUiBkIgiCIHfiIIQv////8PgyAEQiCIIgQgBkL/////D4MiBn58IAUgBn4iBUIgiHwiBkIghiAFQv////8Pg4QgCEIgiCAEIAd+fCAGQiCIfIUgA3wgASkDeCACfSAAQciLAWopAwCFIgNC/////w+DIgQgASkDcCACfCAAQcCLAWopAwCFIgVCIIgiBn4iB0L/////D4MgA0IgiCIDIAVC/////w+DIgV+fCAEIAV+IgRCIIh8IgVCIIYgBEL/////D4OEIAdCIIggAyAGfnwgBUIgiHyFfCEDCyABKQNIIAJ9QQApA6iMAYUiBEL/////D4MiBSABKQNAIAJ8QQApA6CMAYUiBkIgiCIHfiIIQv////8PgyAEQiCIIgQgBkL/////D4MiBn58IAUgBn4iBUIgiHwiBkIghiAFQv////8Pg4QgCEIgiCAEIAd+fCAGQiCIfIUgA3wgASkDWCACfSAAQdiLAWopAwCFIgNC/////w+DIgQgASkDUCACfCAAQdCLAWopAwCFIgVCIIgiBn4iB0L/////D4MgA0IgiCIDIAVC/////w+DIgV+fCAEIAV+IgRCIIh8IgVCIIYgBEL/////D4OEIAdCIIggAyAGfnwgBUIgiHyFfCEDCyABKQMoIAJ9QQApA5iMAYUiBEL/////D4MiBSABKQMgIAJ8QQApA5CMAYUiBkIgiCIHfiIIQv////8PgyAEQiCIIgQgBkL/////D4MiBn58IAUgBn4iBUIgiHwiBkIghiAFQv////8Pg4QgCEIgiCAEIAd+fCAGQiCIfIUgA3wgASkDOCACfSAAQeiLAWopAwCFIgNC/////w+DIgQgASkDMCACfCAAQeCLAWopAwCFIgVCIIgiBn4iB0L/////D4MgA0IgiCIDIAVC/////w+DIgV+fCAEIAV+IgRCIIh8IgVCIIYgBEL/////D4OEIAdCIIggAyAGfnwgBUIgiHyFfCEDCyABKQMIIAJ9QQApA4iMAYUiBEL/////D4MiBSABKQMAIAJ8QQApA4CMAYUiBkIgiCIHfiIIQv////8PgyAEQiCIIgQgBkL/////D4MiBn58IAUgBn4iBUIgiHwiBkIghiAFQv////8Pg4QgCEIgiCAEIAd+fCAGQiCIfIUgA3wgASkDGCACfSAAQfiLAWopAwCFIgNC/////w+DIgQgASkDECACfCAAQfCLAWopAwCFIgJCIIgiBX4iBkL/////D4MgA0IgiCIDIAJC/////w+DIgJ+fCAEIAJ+IgJCIIh8IgRCIIYgAkL/////D4OEIAZCIIggAyAFfnwgBEIgiHyFfCICQiWIIAKFQvnz3fGZ8pmrFn4iAkIgiCAChQv8CgQBfwV+An8BfkEAIQMgASkDeCACfUEAKQP4jAGFIgRC/////w+DIgUgASkDcCACfEEAKQPwjAGFIgZCIIgiB34iCEL/////D4MgBEIgiCIEIAZC/////w+DIgZ+fCAFIAZ+IgVCIIh8IgZCIIYgBUL/////D4OEIAhCIIggBCAHfnwgBkIgiHyFIAEpA2ggAn1BACkD6IwBhSIEQv////8PgyIFIAEpA2AgAnxBACkD4IwBhSIGQiCIIgd+IghC/////w+DIARCIIgiBCAGQv////8PgyIGfnwgBSAGfiIFQiCIfCIGQiCGIAVC/////w+DhCAIQiCIIAQgB358IAZCIIh8hSABKQNYIAJ9QQApA9iMAYUiBEL/////D4MiBSABKQNQIAJ8QQApA9CMAYUiBkIgiCIHfiIIQv////8PgyAEQiCIIgQgBkL/////D4MiBn58IAUgBn4iBUIgiHwiBkIghiAFQv////8Pg4QgCEIgiCAEIAd+fCAGQiCIfIUgASkDSCACfUEAKQPIjAGFIgRC/////w+DIgUgASkDQCACfEEAKQPAjAGFIgZCIIgiB34iCEL/////D4MgBEIgiCIEIAZC/////w+DIgZ+fCAFIAZ+IgVCIIh8IgZCIIYgBUL/////D4OEIAhCIIggBCAHfnwgBkIgiHyFIAEpAzggAn1BACkDuIwBhSIEQv////8PgyIFIAEpAzAgAnxBACkDsIwBhSIGQiCIIgd+IghC/////w+DIARCIIgiBCAGQv////8PgyIGfnwgBSAGfiIFQiCIfCIGQiCGIAVC/////w+DhCAIQiCIIAQgB358IAZCIIh8hSABKQMoIAJ9QQApA6iMAYUiBEL/////D4MiBSABKQMgIAJ8QQApA6CMAYUiBkIgiCIHfiIIQv////8PgyAEQiCIIgQgBkL/////D4MiBn58IAUgBn4iBUIgiHwiBkIghiAFQv////8Pg4QgCEIgiCAEIAd+fCAGQiCIfIUgASkDGCACfUEAKQOYjAGFIgRC/////w+DIgUgASkDECACfEEAKQOQjAGFIgZCIIgiB34iCEL/////D4MgBEIgiCIEIAZC/////w+DIgZ+fCAFIAZ+IgVCIIh8IgZCIIYgBUL/////D4OEIAhCIIggBCAHfnwgBkIgiHyFIAEpAwggAn1BACkDiIwBhSIEQv////8PgyIFIAEpAwAgAnxBACkDgIwBhSIGQiCIIgd+IghC/////w+DIARCIIgiBCAGQv////8PgyIGfnwgBSAGfiIFQiCIfCIGQiCGIAVC/////w+DhCAIQiCIIAQgB358IAZCIIh8hSAArUKHla+vmLbem55/fnx8fHx8fHx8IgRCJYggBIVC+fPd8ZnymasWfiIEQiCIIASFIQQCQCAAQZABSA0AIABBBHZBeGohCQNAIAEgA2oiCkELaikDACACfSADQYiNAWopAwCFIgVC/////w+DIgYgCkEDaikDACACfCADQYCNAWopAwCFIgdCIIgiCH4iC0L/////D4MgBUIgiCIFIAdC/////w+DIgd+fCAGIAd+IgZCIIh8IgdCIIYgBkL/////D4OEIAtCIIggBSAIfnwgB0IgiHyFIAR8IQQgA0EQaiEDIAlBf2oiCQ0ACwsgASkDfyACfSAAQfiLAWopAwCFIgVC/////w+DIgYgASkDdyACfCAAQfCLAWopAwCFIgJCIIgiB34iCEL/////D4MgBUIgiCIFIAJC/////w+DIgJ+fCAGIAJ+IgJCIIh8IgZCIIYgAkL/////D4OEIAhCIIggBSAHfnwgBkIgiHyFIAR8IgJCJYggAoVC+fPd8ZnymasWfiICQiCIIAKFC98FAgF+AX8CQAJAQQApA4AKIgBQRQ0AQYAIIQFCACEADAELAkBBACkDoI4BIABSDQBBACEBDAELQQAhAUEAQq+v79e895Kg/gAgAH03A/iLAUEAIABCxZbr+djShYIofDcD8IsBQQBCj/Hjja2P9JhOIAB9NwPoiwFBACAAQqus+MXV79HQfHw3A+CLAUEAQtOt1LKShbW0nn8gAH03A9iLAUEAIABCl5r0jvWWvO3JAHw3A9CLAUEAQsWDgv2v/8SxayAAfTcDyIsBQQAgAELqi7OdyOb09UN8NwPAiwFBAELIv/rLnJveueQAIAB9NwO4iwFBACAAQoqjgd/Ume2sMXw3A7CLAUEAQvm57738+MKnHSAA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QQApA4CKATcDACACQQApA4iKATcDCCACQQApA5CKATcDECACQQApA5iKATcDGCACQQApA6CKATcDICACQQApA6iKATcDKCACQQApA7CKASIFNwMwIAJBACkDuIoBIgY3AzgCQAJAQQAoAoCOASIHQcAASQ0AIAJBACgCiI4BNgJAIAIgAkHAAGpBACgCmI4BQYCMASAHQX9qQQZ2IANBACgCnI4BIgAQAiADIABqIgBBeWopAwAhCCAAKQMJIQkgACkDGSEKIAApAykhCyAHQcCLAWopAwAhBSAAKQMBIQwgB0HIiwFqKQMAIQYgB0HQiwFqKQMAIQ0gACkDESEOIAdB2IsBaikDACEPIAdB4IsBaikDACEQIAApAyEhESAHQeiLAWopAwAhEiACKQMAIRMgAikDECEUIAIpAyAhFSACKQMwIRYgAikDCCEXIAIpAxghGCACKQMoIRkgAiACKQM4IAdB8IsBaikDACIafCAAKQMxIAdB+IsBaikDACIbhSIcQiCIIBxC/////w+Dfnw3AzggGSAQfCARIBKFIhFCIIggEUL/////D4N+fCERIBggDXwgDiAPhSIOQiCIIA5C/////w+DfnwhDiAXIAV8IAwgBoUiDEIgiCAMQv////8Pg358IQwgGyAWIAsgGoUiC0IgiCALQv////8Pg358fCELIBIgFSAKIBCFIhBCIIggEEL/////D4N+fHwhECAPIBQgCSANhSINQiCIIA1C/////w+Dfnx8IRIgBiATIAggBYUiBUIgiCAFQv////8Pg358fCEIDAELIAdBwI0BaiEdQcAAIAdrIR4gAkHAAGohAAJAAkACQCAHQThNDQAgHiEfDAELAkACQEE4IAdrQQN2QQFqQQdxIh8NACACQcAAaiEAIB4hHwwBCyACQcAAaiEAIB9BA3QiICEfA0AgACAdKQMANwMAIABBCGohACAdQQhqIR0gH0F4aiIfDQALQcAAIAcgIGprIR8LAkAgBw0AA0AgACAdKQMANwMAIABBCGogHUEIaikDADcDACAAQRBqIB1BEGopAwA3AwAgAEEYaiAdQRhqKQMANwMAIABBIGogHUEgaikDADcDACAAQShqIB1BKGopAwA3AwAgAEEwaiAdQTBqKQMANwMAIABBOGogHUE4aikDADcDACAAQcAAaiEAIB1BwABqIR0gH0FAaiIfQQdLDQALCyAfRQ0BCyAfQX9qISECQCAfQQdxIiBFDQAgH0F4cSEfA0AgACAdLQAAOgAAIABBAWohACAdQQFqIR0gIEF/aiIgDQALCyAhQQdJDQADQCAAIB0pAAA3AAAgAEEIaiEAIB1BCGohHSAfQXhqIh8NAAsLIAJBwABqIB5qIR1BgIwBIQACQAJAAkAgB0EISQ0AAkAgB0E4akEDdkEBakEHcSIfDQAMAgsgH0EDdCEgQYCMASEAA0AgHSAAKQMANwMAIB1BCGohHSAAQQhqIQAgH0F/aiIfDQALIAcgIGshBwsgB0UNAQJAAkAgB0EHcSIgDQAgByEfDAELIAdBeHEhHwNAIB0gAC0AADoAACAdQQFqIR0gAEEBaiEAICBBf2oiIA0ACwsgB0EISQ0BCwNAIB0gACkAADcAACAdQQhqIR0gAEEIaiEAIB9BeGoiHw0ACwsgA0EAKAKcjgFqIgBBeWopAwAhCiAAKQMJIRMgACkDGSEUIAApAykhCyAAKQMBIQwgACkDESEOIAApAyEhESACKQMAIRUgAikDECEWIAIpAyAhFyACKQMIIRggAikDQCENIAIpA0ghDyACKQMYIRkgAikDUCESIAIpA1ghCCACKQMoIRogAikDYCEQIAIpA2ghCSACIAYgAikDcCIbfCAAKQMxIAIpA3giBoUiHEIgiCAcQv////8Pg358NwM4IBogEHwgESAJhSIRQiCIIBFC/////w+DfnwhESAZIBJ8IA4gCIUiDkIgiCAOQv////8Pg358IQ4gGCANfCAMIA+FIgxCIIggDEL/////D4N+fCEMIAYgCyAbhSILQiCIIAtC/////w+DfiAFfHwhCyAJIBcgFCAQhSIFQiCIIAVC/////w+Dfnx8IRAgCCAWIBMgEoUiBUIgiCAFQv////8Pg358fCESIA8gFSAKIA2FIgVCIIggBUL/////D4N+fHwhCAsgAykDQyACKQM4hSIFQv////8PgyIGIAMpAzsgC4UiC0IgiCINfiIPQv////8PgyAFQiCIIgUgC0L/////D4MiC358IAYgC34iBkIgiHwiC0IghiAGQv////8Pg4QgD0IgiCAFIA1+fCALQiCIfIUgAykDMyARhSIFQv////8PgyIGIAMpAysgEIUiC0IgiCINfiIPQv////8PgyAFQiCIIgUgC0L/////D4MiC358IAYgC34iBkIgiHwiC0IghiAGQv////8Pg4QgD0IgiCAFIA1+fCALQiCIfIUgAykDIyAOhSIFQv////8PgyIGIAMpAxsgEoUiC0IgiCINfiIPQv////8PgyAFQiCIIgUgC0L/////D4MiC358IAYgC34iBkIgiHwiC0IghiAGQv////8Pg4QgD0IgiCAFIA1+fCALQiCIfIUgAykDEyAMhSIFQv////8PgyIGIAMpAwsgCIUiC0IgiCINfiIPQv////8PgyAFQiCIIgUgC0L/////D4MiC358IAYgC34iBkIgiHwiC0IghiAGQv////8Pg4QgD0IgiCAFIA1+fCALQiCIfIUgBEKHla+vmLbem55/fnx8fHwiBEIliCAEhUL5893xmfKZqxZ+IgRCIIggBIUhBAwBCyAEpyEAAkBBACkDoI4BIgRQDQACQCAAQRBLDQAgAEGACCAEEAUhBAwCCwJAIABBgAFLDQAgAEGACCAEEAYhBAwCCyAAQYAIIAQQByEEDAELAkAgAEEQSw0AIAAgA0IAEAUhBAwBCwJAIABBgAFLDQAgACADQgAQBiEEDAELIAAgA0IAEAchBAtBACAEQjiGIARCgP4Dg0IohoQgBEKAgPwHg0IYhiAEQoCAgPgPg0IIhoSEIARCCIhCgICA+A+DIARCGIhCgID8B4OEIARCKIhCgP4DgyAEQjiIhISENwOACiABJAALBgBBgIoBCwIACwvMAQEAQYAIC8QBuP5sOSOkS758AYEs9yGtHN7UbemDkJfbckCkpLezZx/LeeZOzMDleIJa0H3M/3IhuAhGdPdDJI7gNZDmgTomTDwoUruRwwDLiNBlixtTLqNxZEiXog35TjgZ70ap3qzYqPp2P+OcND/53LvHxwtPHYpR4EvNtFkxyJ9+ydl4c2TqxayDNNPrw8WBoP/6E2PrFw3dUbfw2knTFlUmKdRonisWvlh9R6H8j/i40XrQMc5FyzqPlRYEKK/X+8q7S0B+QAIAAA==";
    hash$6 = "5a2fbdbb";
    wasmJson$6 = {
      name: name$6,
      data: data$6,
      hash: hash$6
    };
    mutex$4 = new Mutex();
    wasmCache$4 = null;
    seedBuffer$1 = new Uint8Array(8);
    name$5 = "xxhash128";
    data$5 = "AGFzbQEAAAABKwdgAAF/YAR/f39/AGAHf39/f39/fwBgA39/fgF+YAR/f39+AGAAAGABfwADDQwAAQIDBAQEBQYFAAUFBAEBAgIGDgJ/AUHAjgULfwBBwAkLB3AIBm1lbW9yeQIADkhhc2hfR2V0QnVmZmVyAAAJSGFzaF9Jbml0AAcLSGFzaF9VcGRhdGUACApIYXNoX0ZpbmFsAAkNSGFzaF9HZXRTdGF0ZQAKDkhhc2hfQ2FsY3VsYXRlAAsKU1RBVEVfU0laRQMBCqBNDAUAQYAKC+QDAw9+AX8BfgJAIANFDQAgACkDMCEEIAApAzghBSAAKQMgIQYgACkDKCEHIAApAxAhCCAAKQMYIQkgACkDACEKIAApAwghCwNAIAUgAUEwaikDACIMfCACQThqKQMAIAFBOGopAwAiDYUiBUIgiCAFQv////8Pg358IQUgByABQSBqKQMAIg58IAJBKGopAwAgAUEoaikDACIPhSIHQiCIIAdC/////w+DfnwhByAJIAFBEGopAwAiEHwgAkEYaikDACABQRhqKQMAIhGFIglCIIggCUL/////D4N+fCEJIAsgASkDACISfCACQQhqIhMpAwAgAUEIaikDACIUhSILQiCIIAtC/////w+DfnwhCyACQTBqKQMAIAyFIgxCIIggDEL/////D4N+IAR8IA18IQQgAkEgaikDACAOhSIMQiCIIAxC/////w+DfiAGfCAPfCEGIAJBEGopAwAgEIUiDEIgiCAMQv////8Pg34gCHwgEXwhCCACKQMAIBKFIgxCIIggDEL/////D4N+IAp8IBR8IQogAUHAAGohASATIQIgA0F/aiIDDQALIAAgCTcDGCAAIAo3AwAgACALNwMIIAAgBzcDKCAAIAg3AxAgACAFNwM4IAAgBjcDICAAIAQ3AzALC94CAgF/AX4CQCAEIAIgASgCACIHayICSQ0AIAAgAyAFIAdBA3RqIAIQASAAIAUgBmoiBykDACAAKQMAIghCL4iFIAiFQrHz3fEJfjcDACAAIAcpAwggACkDCCIIQi+IhSAIhUKx893xCX43AwggACAHKQMQIAApAxAiCEIviIUgCIVCsfPd8Ql+NwMQIAAgBykDGCAAKQMYIghCL4iFIAiFQrHz3fEJfjcDGCAAIAcpAyAgACkDICIIQi+IhSAIhUKx893xCX43AyAgACAHKQMoIAApAygiCEIviIUgCIVCsfPd8Ql+NwMoIAAgBykDMCAAKQMwIghCL4iFIAiFQrHz3fEJfjcDMCAAIAcpAzggACkDOCIIQi+IhSAIhUKx893xCX43AzggACADIAJBBnRqIAUgBCACayIHEAEgASAHNgIADwsgACADIAUgB0EDdGogBBABIAEgByAEajYCAAvtAwEFfiABKQM4IAApAziFIgNC/////w+DIgQgASkDMCAAKQMwhSIFQiCIIgZ+IgdC/////w+DIANCIIgiAyAFQv////8PgyIFfnwgBCAFfiIEQiCIfCIFQiCGIARC/////w+DhCAHQiCIIAMgBn58IAVCIIh8hSABKQMoIAApAyiFIgNC/////w+DIgQgASkDICAAKQMghSIFQiCIIgZ+IgdC/////w+DIANCIIgiAyAFQv////8PgyIFfnwgBCAFfiIEQiCIfCIFQiCGIARC/////w+DhCAHQiCIIAMgBn58IAVCIIh8hSABKQMYIAApAxiFIgNC/////w+DIgQgASkDECAAKQMQhSIFQiCIIgZ+IgdC/////w+DIANCIIgiAyAFQv////8PgyIFfnwgBCAFfiIEQiCIfCIFQiCGIARC/////w+DhCAHQiCIIAMgBn58IAVCIIh8hSABKQMIIAApAwiFIgNC/////w+DIgQgASkDACAAKQMAhSIFQiCIIgZ+IgdC/////w+DIANCIIgiAyAFQv////8PgyIFfnwgBCAFfiIEQiCIfCIFQiCGIARC/////w+DhCAHQiCIIAMgBn58IAVCIIh8hSACfHx8fCICQiWIIAKFQvnz3fGZ8pmrFn4iAkIgiCAChQu6CAIFfgN/AkAgAUEJSQ0AIAAgAUH4iwFqKQMAIgQgAikDOCACKQMwhSADfIUiBUL/////D4NC95Svrwh+IAVCgICAgHCDfEEAKQOAjAEgAikDKCACKQMghSADfYUgBIUiA0IgiCIEQrHz3fEJfnwgBEKHla+vCH4iBEIgiHwgBEL/////D4MgA0L/////D4MiA0Kx893xCX58IANCh5Wvrwh+IgRCIIh8IgVCIIh8IgNCOIYgA0KA/gODQiiGhCADQoCA/AeDQhiGIANCgICA+A+DQgiGhIQgA0IIiEKAgID4D4MgA0IYiEKAgPwHg4QgA0IoiEKA/gODIANCOIiEhIQgBEL/////D4MgAUF/aq1CNoaEIAVCIIZ8hSIEQiCIIgVCz9bTvgJ+IgZC/////w+DIARC/////w+DIgRCvdzKlQx+fCAEQs/W074CfiIEQiCIfCIHQiCGIghCJYggCCAEQv////8Pg4SFQvnz3fGZ8pmrFn4iBEIgiCAEhTcDACAAIAVCvdzKlQx+IANCz9bTvtLHq9lCfnwgBkIgiHwgB0IgiHwiA0IliCADhUL5893xmfKZqxZ+IgNCIIggA4U3AwgPCwJAIAFBBEkNACAAIAIpAxggAikDEIUgA6ciAkEYdCACQYD+A3FBCHRyIAJBCHZBgP4DcSACQRh2cnKtQiCGIAOFfCABQfyLAWo1AgBCIIZBADUCgIwBhIUiA0IgiCIEIAFBAnRBh5Wvr3hqrSIFfiIGQiCIIARCsfPd8Ql+fCAGQv////8PgyADQv////8PgyIDQrHz3fEJfnwgAyAFfiIDQiCIfCIEQiCIfCAEQiCGIANC/////w+DhCIEQgGGfCIDQiWIIAOFQvnz3fGZ8pmrFn4iBUIgiCAFhTcDCCAAIANCA4ggBIUiA0IjiCADhUKlvuP00YyH2Z9/fiIDQhyIIAOFNwMADwsCQCABRQ0AIAAgAigCBCACKAIAc60gA3wiBEIhiEEALQCAjAFBEHQgAUEIdHIiCSABQQF2QYCMAWotAABBGHRyIgogAUH/iwFqLQAAIgFyIguthSAEhULP1tO+0ser2UJ+IgRCHYggBIVC+fPd8Zn2masWfiIEQiCIIASFNwMAIAAgAigCDCACKAIIc60gA30iA0IhiCABQRh0IAtBgP4DcUEIdHIgCUEIdkGA/gNxIApBGHZyckENd62FIAOFQs/W077Sx6vZQn4iA0IdiCADhUL5893xmfaZqxZ+IgNCIIggA4U3AwgPCyAAIAIpA1AgAikDWIUgA4UiBEIhiCAEhULP1tO+0ser2UJ+IgRCHYggBIVC+fPd8Zn2masWfiIEQiCIIASFNwMIIAAgAikDQCACKQNIhSADhSIDQiGIIAOFQs/W077Sx6vZQn4iA0IdiCADhUL5893xmfaZqxZ+IgNCIIggA4U3AwALwwoBCn4gAa0iBEKHla+vmLbem55/fiEFAkACQCABQSFPDQBCACEGDAELQgAhBwJAIAFBwQBJDQBCACEHAkAgAUHhAEkNACACQfgAaikDACADfSABQciLAWopAwAiCIUiB0L/////D4MiCSACKQNwIAN8IAFBwIsBaikDACIKhSILQiCIIgx+Ig1CIIggB0IgiCIHIAx+fCANQv////8PgyAHIAtC/////w+DIgt+fCAJIAt+IgdCIIh8IglCIIh8QQApA7iMASILQQApA7CMASIMfIUgCUIghiAHQv////8Pg4SFIQcgAkHoAGopAwAgA30gC4UiCUL/////D4MiCyACKQNgIAN8IAyFIgxCIIgiDX4iBkL/////D4MgCUIgiCIJIAxC/////w+DIgx+fCALIAx+IgtCIIh8IgxCIIYgC0L/////D4OEIAZCIIggCSANfnwgDEIgiHyFIAV8IAggCnyFIQULIAJB2ABqKQMAIAN9IAFB2IsBaikDACIIhSIJQv////8PgyIKIAIpA1AgA3wgAUHQiwFqKQMAIguFIgxCIIgiDX4iBkL/////D4MgCUIgiCIJIAxC/////w+DIgx+fCAKIAx+IgpCIIh8IgxCIIYgCkL/////D4OEIAZCIIggCSANfnwgDEIgiHyFIAd8QQApA6iMASIJQQApA6CMASIKfIUhByACQcgAaikDACADfSAJhSIJQv////8PgyIMIAIpA0AgA3wgCoUiCkIgiCINfiIGQv////8PgyAJQiCIIgkgCkL/////D4MiCn58IAwgCn4iCkIgiHwiDEIghiAKQv////8Pg4QgBkIgiCAJIA1+fCAMQiCIfIUgBXwgCCALfIUhBQsgAkE4aikDACADfSABQeiLAWopAwAiCIUiCUL/////D4MiCiACKQMwIAN8IAFB4IsBaikDACILhSIMQiCIIg1+IgZC/////w+DIAlCIIgiCSAMQv////8PgyIMfnwgCiAMfiIKQiCIfCIMQiCGIApC/////w+DhCAGQiCIIAkgDX58IAxCIIh8hSAHfEEAKQOYjAEiB0EAKQOQjAEiCXyFIQYgAkEoaikDACADfSAHhSIHQv////8PgyIKIAIpAyAgA3wgCYUiCUIgiCIMfiINQv////8PgyAHQiCIIgcgCUL/////D4MiCX58IAogCX4iCUIgiHwiCkIghiAJQv////8Pg4QgDUIgiCAHIAx+fCAKQiCIfIUgBXwgCCALfIUhBQsgACACQRhqKQMAIAN9IAFB+IsBaikDACIHhSIIQv////8PgyIJIAIpAxAgA3wgAUHwiwFqKQMAIgqFIgtCIIgiDH4iDUL/////D4MgCEIgiCIIIAtC/////w+DIgt+fCAJIAt+IglCIIh8IgtCIIYgCUL/////D4OEIA1CIIggCCAMfnwgC0IgiHyFIAZ8QQApA4iMASIIQQApA4CMASIJfIUiCyACQQhqKQMAIAN9IAiFIghC/////w+DIgwgAikDACADfCAJhSIJQiCIIg1+IgZC/////w+DIAhCIIgiCCAJQv////8PgyIJfnwgDCAJfiIJQiCIfCIMQiCGIAlC/////w+DhCAGQiCIIAggDX58IAxCIIh8hSAFfCAHIAp8hSIFfCIHQiWIIAeFQvnz3fGZ8pmrFn4iB0IgiCAHhTcDACAAQgAgBUKHla+vmLbem55/fiAEIAN9Qs/W077Sx6vZQn58IAtC49zKlfzO8vWFf358IgNCJYggA4VC+fPd8ZnymasWfiIDQiCIIAOFfTcDCAuhDwMBfxR+An9BACEEIAJB+ABqKQMAIAN9QQApA/iMASIFhSIGQv////8PgyIHIAIpA3AgA3xBACkD8IwBIgiFIglCIIgiCn4iC0L/////D4MgBkIgiCIGIAlC/////w+DIgl+fCAHIAl+IgdCIIh8IglCIIYgB0L/////D4OEIAtCIIggBiAKfnwgCUIgiHyFIAJB2ABqKQMAIAN9QQApA9iMASIHhSIGQv////8PgyIJIAIpA1AgA3xBACkD0IwBIgqFIgtCIIgiDH4iDUL/////D4MgBkIgiCIGIAtC/////w+DIgt+fCAJIAt+IglCIIh8IgtCIIYgCUL/////D4OEIA1CIIggBiAMfnwgC0IgiHyFIAJBOGopAwAgA31BACkDuIwBIgmFIgZC/////w+DIgsgAikDMCADfEEAKQOwjAEiDIUiDUIgiCIOfiIPQv////8PgyAGQiCIIgYgDUL/////D4MiDX58IAsgDX4iC0IgiHwiDUIghiALQv////8Pg4QgD0IgiCAGIA5+fCANQiCIfIUgAkEYaikDACADfUEAKQOYjAEiC4UiBkL/////D4MiDSACKQMQIAN8QQApA5CMASIOhSIPQiCIIhB+IhFC/////w+DIAZCIIgiBiAPQv////8PgyIPfnwgDSAPfiINQiCIfCIPQiCGIA1C/////w+DhCARQiCIIAYgEH58IA9CIIh8hUEAKQOIjAEiDUEAKQOAjAEiD3yFfEEAKQOojAEiEEEAKQOgjAEiEXyFfEEAKQPIjAEiEkEAKQPAjAEiE3yFfEEAKQPojAEiFEEAKQPgjAEiFXyFIgZCJYggBoVC+fPd8ZnymasWfiIGQiCIIAaFIQYgAkHoAGopAwAgA30gFIUiFEL/////D4MiFiACKQNgIAN8IBWFIhVCIIgiF34iGEL/////D4MgFEIgiCIUIBVC/////w+DIhV+fCAWIBV+IhVCIIh8IhZCIIYgFUL/////D4OEIBhCIIggFCAXfnwgFkIgiHyFIAJByABqKQMAIAN9IBKFIhJC/////w+DIhQgAikDQCADfCAThSITQiCIIhV+IhZC/////w+DIBJCIIgiEiATQv////8PgyITfnwgFCATfiITQiCIfCIUQiCGIBNC/////w+DhCAWQiCIIBIgFX58IBRCIIh8hSACQShqKQMAIAN9IBCFIhBC/////w+DIhIgAikDICADfCARhSIRQiCIIhN+IhRC/////w+DIBBCIIgiECARQv////8PgyIRfnwgEiARfiIRQiCIfCISQiCGIBFC/////w+DhCAUQiCIIBAgE358IBJCIIh8hSACQQhqKQMAIAN9IA2FIg1C/////w+DIhAgAikDACADfCAPhSIPQiCIIhF+IhJC/////w+DIA1CIIgiDSAPQv////8PgyIPfnwgECAPfiIPQiCIfCIQQiCGIA9C/////w+DhCASQiCIIA0gEX58IBBCIIh8hSABrSIPQoeVr6+Ytt6bnn9+fCALIA58hXwgCSAMfIV8IAcgCnyFfCAFIAh8hSIFQiWIIAWFQvnz3fGZ8pmrFn4iBUIgiCAFhSEFAkAgAUGgAUgNACABQQV2QXxqIRkDQCACIARqIhpBG2opAwAgA30gBEGYjQFqKQMAIgeFIghC/////w+DIgkgGkETaikDACADfCAEQZCNAWopAwAiCoUiC0IgiCIMfiINQv////8PgyAIQiCIIgggC0L/////D4MiC358IAkgC34iCUIgiHwiC0IghiAJQv////8Pg4QgDUIgiCAIIAx+fCALQiCIfIUgBnwgBEGIjQFqKQMAIgggBEGAjQFqKQMAIgl8hSEGIBpBC2opAwAgA30gCIUiCEL/////D4MiCyAaQQNqKQMAIAN8IAmFIglCIIgiDH4iDUL/////D4MgCEIgiCIIIAlC/////w+DIgl+fCALIAl+IglCIIh8IgtCIIYgCUL/////D4OEIA1CIIggCCAMfnwgC0IgiHyFIAV8IAcgCnyFIQUgBEEgaiEEIBlBf2oiGQ0ACwsgACACQf8AaikDACADfCABQeiLAWopAwAiB4UiCEL/////D4MiCSACKQN3IAN9IAFB4IsBaikDACIKhSILQiCIIgx+Ig1C/////w+DIAhCIIgiCCALQv////8PgyILfnwgCSALfiIJQiCIfCILQiCGIAlC/////w+DhCANQiCIIAggDH58IAtCIIh8hSAGfCABQfiLAWopAwAiBiABQfCLAWopAwAiCHyFIgkgAkHvAGopAwAgA3wgBoUiBkL/////D4MiCyACKQNnIAN9IAiFIghCIIgiDH4iDUL/////D4MgBkIgiCIGIAhC/////w+DIgh+fCALIAh+IghCIIh8IgtCIIYgCEL/////D4OEIA1CIIggBiAMfnwgC0IgiHyFIAV8IAcgCnyFIgZ8IgVCJYggBYVC+fPd8ZnymasWfiIFQiCIIAWFNwMAIABCACAGQoeVr6+Ytt6bnn9+IA8gA31Cz9bTvtLHq9lCfnwgCULj3MqV/M7y9YV/fnwiA0IliCADhUL5893xmfKZqxZ+IgNCIIggA4V9NwMIC98FAgF+AX8CQAJAQQApA4AKIgBQRQ0AQYAIIQFCACEADAELAkBBACkDoI4BIABSDQBBACEBDAELQQAhAUEAQq+v79e895Kg/gAgAH03A/iLAUEAIABCxZbr+djShYIofDcD8IsBQQBCj/Hjja2P9JhOIAB9NwPoiwFBACAAQqus+MXV79HQfHw3A+CLAUEAQtOt1LKShbW0nn8gAH03A9iLAUEAIABCl5r0jvWWvO3JAHw3A9CLAUEAQsWDgv2v/8SxayAAfTcDyIsBQQAgAELqi7OdyOb09UN8NwPAiwFBAELIv/rLnJveueQAIAB9NwO4iwFBACAAQoqjgd/Ume2sMXw3A7CLAUEAQvm57738+MKnHSAAfTcDqIsBQQAgAEKo9dv7s5ynmj98NwOgiwFBAEK4sry3lNW31lggAH03A5iLAUEAIABC8cihuqm0w/zOAHw3A5CLAUEAQoihl9u445SXo38gAH03A4iL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AkHAAGogDGohC0GAjAEhAAJAAkACQCAHQQhJDQACQCAHQThqQQN2QQFqQQdxIg0NAAwCCyANQQN0IQ5BgIwBIQADQCALIAApAwA3AwAgC0EIaiELIABBCGohACANQX9qIg0NAAsgByAOayEHCyAHRQ0BAkACQCAHQQdxIg4NACAHIQ0MAQsgB0F4cSENA0AgCyAALQAAOgAAIAtBAWohCyAAQQFqIQAgDkF/aiIODQALCyAHQQhJDQELA0AgCyAAKQAANwAAIAtBCGohCyAAQQhqIQAgDUF4aiINDQALCyACIAIpAwggAikDQCIIfCADQQAoApyOAWoiACkDASACKQNIIgmFIgpCIIggCkL/////D4N+fDcDCCACIAIpAxggAikDUCIKfCAAKQMRIAIpA1giEIUiEUIgiCARQv////8Pg358NwMYIAIgECAKIAApAwmFIgpCIIggCkL/////D4N+IAIpAxB8fDcDECACIAkgCCAAQXlqKQMAhSIIQiCIIAhC/////w+DfiACKQMAfHw3AwAgACkDGSEIIAIpAyAhCSACIAIpAyggAikDYCIKfCAAKQMhIAIpA2giEIUiEUIgiCARQv////8Pg358NwMoIAIgECAJIAggCoUiCEIgiCAIQv////8Pg358fDcDICACIAYgAikDcCIIfCAAKQMxIAIpA3giBoUiCUIgiCAJQv////8Pg358NwM4IAIgBiAIIAApAymFIghCIIggCEL/////D4N+IAV8fDcDMAsgAiACIANBC2ogBEKHla+vmLbem55/fhADNwNAIAIgAiADQQAoApyOAWpBdWogBELP1tO+0ser2UJ+Qn+FEAM3A0gMAQsgBKchAAJAQQApA6COASIEUA0AAkAgAEEQSw0AIAJBwABqIABBgAggBBAEDAILAkAgAEGAAUsNACACQcAAaiAAQYAIIAQQBQwCCyACQcAAaiAAQYAIIAQQBgwBCwJAIABBEEsNACACQcAAaiAAIANCABAEDAELAkAgAEGAAUsNACACQcAAaiAAIANCABAFDAELIAJBwABqIAAgA0IAEAYLQQAgAikDcDcDuApBACACKQNgNwOoCkEAIAIpA1A3A5gKQQAgAkH4AGopAwA3A8AKQQAgAkHoAGopAwA3A7AKQQAgAkHYAGopAwA3A6AKQQAgAikDSCIEQjiGIARCgP4Dg0IohoQgBEKAgPwHg0IYhiAEQoCAgPgPg0IIhoSEIARCCIhCgICA+A+DIARCGIhCgID8B4OEIARCKIhCgP4DgyAEQjiIhISEIgQ3A4AKQQAgBDcDkApBACACKQNAIgRCOIYgBEKA/gODQiiGhCAEQoCA/AeDQhiGIARCgICA+A+DQgiGhIQgBEIIiEKAgID4D4MgBEIYiEKAgPwHg4QgBEIoiEKA/gODIARCOIiEhIQ3A4gKIAEkAAsGAEGAigELAgALC8wBAQBBgAgLxAG4/mw5I6RLvnwBgSz3Ia0c3tRt6YOQl9tyQKSkt7NnH8t55k7MwOV4glrQfcz/ciG4CEZ090MkjuA1kOaBOiZMPChSu5HDAMuI0GWLG1Muo3FkSJeiDflOOBnvRqnerNio+nY/45w0P/ncu8fHC08dilHgS820WTHIn37J2XhzZOrFrIM00+vDxYGg//oTY+sXDd1Rt/DaSdMWVSYp1GieKxa+WH1HofyP+LjRetAxzkXLOo+VFgQor9f7yrtLQH5AAgAA";
    hash$5 = "b9ab74e2";
    wasmJson$5 = {
      name: name$5,
      data: data$5,
      hash: hash$5
    };
    mutex$3 = new Mutex();
    wasmCache$3 = null;
    seedBuffer = new Uint8Array(8);
    name$4 = "ripemd160";
    data$4 = "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";
    hash$4 = "6abbce74";
    wasmJson$4 = {
      name: name$4,
      data: data$4,
      hash: hash$4
    };
    mutex$2 = new Mutex();
    wasmCache$2 = null;
    validateOptions$2 = (options) => {
      if (!options || typeof options !== "object") {
        throw new Error("Invalid options parameter. It requires an object.");
      }
      if (!options.hashFunction || !options.hashFunction.then) {
        throw new Error('Invalid hash function is provided! Usage: pbkdf2("password", "salt", 1000, 32, createSHA1()).');
      }
      if (!Number.isInteger(options.iterations) || options.iterations < 1) {
        throw new Error("Iterations should be a positive number");
      }
      if (!Number.isInteger(options.hashLength) || options.hashLength < 1) {
        throw new Error("Hash length should be a positive number");
      }
      if (options.outputType === void 0) {
        options.outputType = "hex";
      }
      if (!["hex", "binary"].includes(options.outputType)) {
        throw new Error(`Insupported output type ${options.outputType}. Valid values: ['hex', 'binary']`);
      }
    };
    name$3 = "scrypt";
    data$3 = "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cyICajYCOCAAIAAoAjwgAiAKakESdyAGc2o2AjwLvxIDFX8Bfg5/AkAgAkUNACAAQQd0IgNBQGoiBEEAKAKACCIFIAMgAmwiBmogAyABbGoiByADaiIIaiEJIAAgAkEHdCIKIAFBB3RqIgtsIQwgACALQYABamwhDSAAQQV0IgtBASALQQFLGyILQWBxIQ4gC0EBcSEPIAdBeGohECAHQXBqIREgB0FoaiESIAdBYGohEyAHQVhqIRQgB0FQaiEVIAdBSGohFiAHQUBqIRcgAa1Cf3whGCAEIAdqIRkgByAAQQh0IhpqIRsgACAKQYABamwhHCALQQRJIR1BACEeQQAhHwNAQQAoAoAIIiAgAyAfbGohIQJAIABFDQBBACEiAkAgHQ0AICAgHmohI0EAIQtBACEiA0AgByALaiIEICMgC2oiJCgCADYCACAEQQRqICRBBGooAgA2AgAgBEEIaiAkQQhqKAIANgIAIARBDGogJEEMaigCADYCACALQRBqIQsgDiAiQQRqIiJHDQALCyAPRQ0AIAcgIkECdCILaiAhIAtqKAIANgIACwJAIAFFDQBBACElIBwhIyAGISYDQCAFISQgACEiAkACQCAADQAgGyAXKQMANwMAIBsgFikDADcDCCAbIBUpAwA3AxAgGyAUKQMANwMYIBsgEykDADcDICAbIBIpAwA3AyggGyARKQMANwMwIBsgECkDADcDOAwBCwNAICQgJmoiCyAkIAxqIgQpAwA3AwAgC0EIaiAEQQhqKQMANwMAIAtBEGogBEEQaikDADcDACALQRhqIARBGGopAwA3AwAgC0EgaiAEQSBqKQMANwMAIAtBKGogBEEoaikDADcDACALQTBqIARBMGopAwA3AwAgC0E4aiAEQThqKQMANwMAIAtBwABqIARBwABqKQMANwMAIAtByABqIARByABqKQMANwMAIAtB0ABqIARB0ABqKQMANwMAIAtB2ABqIARB2ABqKQMANwMAIAtB4ABqIARB4ABqKQMANwMAIAtB6ABqIARB6ABqKQMANwMAIAtB8ABqIARB8ABqKQMANwMAIAtB+ABqIARB+ABqKQMANwMAICRBgAFqISQgIkF/aiIiDQALIAcgCCAbIAAQAiAFISQgACEiA0AgJCAjaiILICQgDWoiBCkDADcDACALQQhqIARBCGopAwA3AwAgC0EQaiAEQRBqKQMANwMAIAtBGGogBEEYaikDADcDACALQSBqIARBIGopAwA3AwAgC0EoaiAEQShqKQMANwMAIAtBMGogBEEwaikDADcDACALQThqIARBOGopAwA3AwAgC0HAAGogBEHAAGopAwA3AwAgC0HIAGogBEHIAGopAwA3AwAgC0HQAGogBEHQAGopAwA3AwAgC0HYAGogBEHYAGopAwA3AwAgC0HgAGogBEHgAGopAwA3AwAgC0HoAGogBEHoAGopAwA3AwAgC0HwAGogBEHwAGopAwA3AwAgC0H4AGogBEH4AGopAwA3AwAgJEGAAWohJCAiQX9qIiINAAsLIAggByAbIAAQAiAjIBpqISMgJiAaaiEmICVBAmoiJSABSQ0AC0EAISUDQAJAAkAgAA0AIBsgFykDADcDACAbIBYpAwA3AwggGyAVKQMANwMQIBsgFCkDADcDGCAbIBMpAwA3AyAgGyASKQMANwMoIBsgESkDADcDMCAbIBApAwA3AzgMAQsgACAKIBkpAgAgGIOnQQd0amwhJiAFISQgACEiA0AgJCAMaiILIAspAwAgJCAmaiIEKQMAhTcDACALQQhqIiMgIykDACAEQQhqKQMAhTcDACALQRBqIiMgIykDACAEQRBqKQMAhTcDACALQRhqIiMgIykDACAEQRhqKQMAhTcDACALQSBqIiMgIykDACAEQSBqKQMAhTcDACALQShqIiMgIykDACAEQShqKQMAhTcDACALQTBqIiMgIykDACAEQTBqKQMAhTcDACALQThqIiMgIykDACAEQThqKQMAhTcDACALQcAAaiIjICMpAwAgBEHAAGopAwCFNwMAIAtByABqIiMgIykDACAEQcgAaikDAIU3AwAgC0HQAGoiIyAjKQMAIARB0ABqKQMAhTcDACALQdgAaiIjICMpAwAgBEHYAGopAwCFNwMAIAtB4ABqIiMgIykDACAEQeAAaikDAIU3AwAgC0HoAGoiIyAjKQMAIARB6ABqKQMAhTcDACALQfAAaiIjICMpAwAgBEHwAGopAwCFNwMAIAtB+ABqIgsgCykDACAEQfgAaikDAIU3AwAgJEGAAWohJCAiQX9qIiINAAsgByAIIBsgABACIAAgCiAJKQIAIBiDp0EHdGpsISYgBSEkIAAhIgNAICQgDWoiCyALKQMAICQgJmoiBCkDAIU3AwAgC0EIaiIjICMpAwAgBEEIaikDAIU3AwAgC0EQaiIjICMpAwAgBEEQaikDAIU3AwAgC0EYaiIjICMpAwAgBEEYaikDAIU3AwAgC0EgaiIjICMpAwAgBEEgaikDAIU3AwAgC0EoaiIjICMpAwAgBEEoaikDAIU3AwAgC0EwaiIjICMpAwAgBEEwaikDAIU3AwAgC0E4aiIjICMpAwAgBEE4aikDAIU3AwAgC0HAAGoiIyAjKQMAIARBwABqKQMAhTcDACALQcgAaiIjICMpAwAgBEHIAGopAwCFNwMAIAtB0ABqIiMgIykDACAEQdAAaikDAIU3AwAgC0HYAGoiIyAjKQMAIARB2ABqKQMAhTcDACALQeAAaiIjICMpAwAgBEHgAGopAwCFNwMAIAtB6ABqIiMgIykDACAEQegAaikDAIU3AwAgC0HwAGoiIyAjKQMAIARB8ABqKQMAhTcDACALQfgAaiILIAspAwAgBEH4AGopAwCFNwMAICRBgAFqISQgIkF/aiIiDQALCyAIIAcgGyAAEAIgJUECaiIlIAFJDQALCwJAIABFDQBBACEiAkAgHQ0AICAgHmohI0EAIQtBACEiA0AgIyALaiIEIAcgC2oiJCgCADYCACAEQQRqICRBBGooAgA2AgAgBEEIaiAkQQhqKAIANgIAIARBDGogJEEMaigCADYCACALQRBqIQsgDiAiQQRqIiJHDQALCyAPRQ0AICEgIkECdCILaiAHIAtqKAIANgIACyAeIANqIR4gH0EBaiIfIAJHDQALCws=";
    hash$3 = "b32721f8";
    wasmJson$3 = {
      name: name$3,
      data: data$3,
      hash: hash$3
    };
    isPowerOfTwo = (v) => v && !(v & v - 1);
    validateOptions$1 = (options) => {
      if (!options || typeof options !== "object") {
        throw new Error("Invalid options parameter. It requires an object.");
      }
      if (!Number.isInteger(options.blockSize) || options.blockSize < 1) {
        throw new Error("Block size should be a positive number");
      }
      if (!Number.isInteger(options.costFactor) || options.costFactor < 2 || !isPowerOfTwo(options.costFactor)) {
        throw new Error("Cost factor should be a power of 2, greater than 1");
      }
      if (!Number.isInteger(options.parallelism) || options.parallelism < 1) {
        throw new Error("Parallelism should be a positive number");
      }
      if (!Number.isInteger(options.hashLength) || options.hashLength < 1) {
        throw new Error("Hash length should be a positive number.");
      }
      if (options.outputType === void 0) {
        options.outputType = "hex";
      }
      if (!["hex", "binary"].includes(options.outputType)) {
        throw new Error(`Insupported output type ${options.outputType}. Valid values: ['hex', 'binary']`);
      }
    };
    name$2 = "bcrypt";
    data$2 = "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";
    hash$2 = "8bd8822d";
    wasmJson$2 = {
      name: name$2,
      data: data$2,
      hash: hash$2
    };
    validateOptions = (options) => {
      if (!options || typeof options !== "object") {
        throw new Error("Invalid options parameter. It requires an object.");
      }
      if (!Number.isInteger(options.costFactor) || options.costFactor < 4 || options.costFactor > 31) {
        throw new Error("Cost factor should be a number between 4 and 31");
      }
      options.password = getUInt8Buffer(options.password);
      if (options.password.length < 1) {
        throw new Error("Password should be at least 1 byte long");
      }
      if (options.password.length > 72) {
        throw new Error("Password should be at most 72 bytes long");
      }
      options.salt = getUInt8Buffer(options.salt);
      if (options.salt.length !== 16) {
        throw new Error("Salt should be 16 bytes long");
      }
      if (options.outputType === void 0) {
        options.outputType = "encoded";
      }
      if (!["hex", "binary", "encoded"].includes(options.outputType)) {
        throw new Error(`Insupported output type ${options.outputType}. Valid values: ['hex', 'binary', 'encoded']`);
      }
    };
    validateHashCharacters = (hash2) => {
      if (!/^\$2[axyb]\$[0-3][0-9]\$[./A-Za-z0-9]{53}$/.test(hash2)) {
        return false;
      }
      if (hash2[4] === "0" && Number(hash2[5]) < 4) {
        return false;
      }
      if (hash2[4] === "3" && Number(hash2[5]) > 1) {
        return false;
      }
      return true;
    };
    validateVerifyOptions = (options) => {
      if (!options || typeof options !== "object") {
        throw new Error("Invalid options parameter. It requires an object.");
      }
      if (options.hash === void 0 || typeof options.hash !== "string") {
        throw new Error("Hash should be specified");
      }
      if (options.hash.length !== 60) {
        throw new Error("Hash should be 60 bytes long");
      }
      if (!validateHashCharacters(options.hash)) {
        throw new Error("Invalid hash");
      }
      options.password = getUInt8Buffer(options.password);
      if (options.password.length < 1) {
        throw new Error("Password should be at least 1 byte long");
      }
      if (options.password.length > 72) {
        throw new Error("Password should be at most 72 bytes long");
      }
    };
    name$1 = "whirlpool";
    data$1 = "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";
    hash$1 = "8d8f6035";
    wasmJson$1 = {
      name: name$1,
      data: data$1,
      hash: hash$1
    };
    mutex$1 = new Mutex();
    wasmCache$1 = null;
    name = "sm3";
    data = "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";
    hash = "b6fb4b8e";
    wasmJson = {
      name,
      data,
      hash
    };
    mutex = new Mutex();
    wasmCache = null;
  }
});

// ../../node_modules/@noble/hashes/_u64.js
function fromBig(n, le = false) {
  if (le)
    return { h: Number(n & U32_MASK64), l: Number(n >> _32n & U32_MASK64) };
  return { h: Number(n >> _32n & U32_MASK64) | 0, l: Number(n & U32_MASK64) | 0 };
}
function split(lst, le = false) {
  const len = lst.length;
  let Ah = new Uint32Array(len);
  let Al = new Uint32Array(len);
  for (let i = 0; i < len; i++) {
    const { h, l } = fromBig(lst[i], le);
    [Ah[i], Al[i]] = [h, l];
  }
  return [Ah, Al];
}
function setU64FromNum(view, byteOffset, n, isLE2) {
  const h = fromNumH(n);
  const l = fromNumL(n);
  view.setUint32(byteOffset, isLE2 ? l : h, isLE2);
  view.setUint32(byteOffset + 4, isLE2 ? h : l, isLE2);
}
function add(Ah, Al, Bh, Bl) {
  const l = (Al >>> 0) + (Bl >>> 0);
  return { h: Ah + Bh + (l / 2 ** 32 | 0) | 0, l: l | 0 };
}
var U32_MASK64, _32n, fromNumH, fromNumL, shrSH, shrSL, rotrSH, rotrSL, rotrBH, rotrBL, add3L, add3H, add4L, add4H, add5L, add5H;
var init_u64 = __esm({
  "../../node_modules/@noble/hashes/_u64.js"() {
    "use strict";
    U32_MASK64 = /* @__PURE__ */ (() => BigInt(2 ** 32 - 1))();
    _32n = /* @__PURE__ */ BigInt(32);
    fromNumH = (n) => n / 2 ** 32 | 0;
    fromNumL = (n) => n >>> 0;
    shrSH = (h, _l, s) => h >>> s;
    shrSL = (h, l, s) => h << 32 - s | l >>> s;
    rotrSH = (h, l, s) => h >>> s | l << 32 - s;
    rotrSL = (h, l, s) => h << 32 - s | l >>> s;
    rotrBH = (h, l, s) => h << 64 - s | l >>> s - 32;
    rotrBL = (h, l, s) => h >>> s - 32 | l << 64 - s;
    add3L = (Al, Bl, Cl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0);
    add3H = (low, Ah, Bh, Ch) => Ah + Bh + Ch + (low / 2 ** 32 | 0) | 0;
    add4L = (Al, Bl, Cl, Dl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0);
    add4H = (low, Ah, Bh, Ch, Dh) => Ah + Bh + Ch + Dh + (low / 2 ** 32 | 0) | 0;
    add5L = (Al, Bl, Cl, Dl, El) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0) + (El >>> 0);
    add5H = (low, Ah, Bh, Ch, Dh, Eh) => Ah + Bh + Ch + Dh + Eh + (low / 2 ** 32 | 0) | 0;
  }
});

// ../../node_modules/@noble/hashes/utils.js
function isBytes(a) {
  return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array" && "BYTES_PER_ELEMENT" in a && a.BYTES_PER_ELEMENT === 1;
}
function anumber(n, title = "") {
  if (typeof n !== "number")
    throw new TypeError(atitle(title) + "expected number, got " + typeof n);
  if (!Number.isSafeInteger(n) || n < 0)
    throw new RangeError(atitle(title) + "expected integer >= 0, got " + n);
  return n;
}
function abytes(value, length, title = "") {
  if (isBytes(value) && (length === void 0 || value.length === length))
    return value;
  if (length !== void 0)
    anumber(length, "length");
  const bytes = isBytes(value);
  const ofLen = length !== void 0 ? ` of length ${length}` : "";
  const got = bytes ? `length=${value.length}` : `type=${typeof value}`;
  const message = atitle(title) + "expected Uint8Array" + ofLen + ", got " + got;
  if (!bytes)
    throw new TypeError(message);
  throw new RangeError(message);
}
function ahash(h) {
  if (typeof h !== "function" || typeof h.create !== "function")
    throw new TypeError("expected hash wrapped by utils.createHasher");
  anumber(h.outputLen);
  anumber(h.blockLen);
  if (h.outputLen < 1 || h.blockLen < 1)
    throw new Error("hash blockLen / outputLen must be >= 1");
}
function aexists(instance, checkFinished = true) {
  if (instance.destroyed)
    throw new Error("hash was destroyed");
  if (checkFinished && instance.finished)
    throw new Error("digest() was already called");
}
function aoutput(out, instance) {
  abytes(out, void 0, "output");
  const min = instance.outputLen;
  if (!(out.length >= min)) {
    throw new RangeError('"output" expected length >= ' + min);
  }
}
function clean(...arrays) {
  for (let i = 0; i < arrays.length; i++) {
    arrays[i].fill(0);
  }
}
function createView(arr) {
  return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
}
function rotr(word, shift) {
  return word << 32 - shift | word >>> shift;
}
function bytesToHex(bytes) {
  abytes(bytes);
  if (hasHexBuiltin)
    return bytes.toHex();
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += hexes[bytes[i]];
  }
  return hex;
}
function asciiToBase16(ch) {
  return ch >= 48 && ch <= 57 ? ch - 48 : ch >= 65 && ch <= 70 ? ch - (65 - 10) : ch >= 97 && ch <= 102 ? ch - (97 - 10) : void 0;
}
function hexToBytes(hex) {
  if (typeof hex !== "string")
    throw new TypeError("hex string expected, got " + typeof hex);
  if (hasHexBuiltin) {
    try {
      return Uint8Array.fromHex(hex);
    } catch (error2) {
      if (error2 instanceof SyntaxError)
        throw new RangeError(error2.message);
      throw error2;
    }
  }
  const hl = hex.length;
  const al = hl / 2;
  if (hl % 2)
    throw new RangeError("hex string expected, got unpadded hex of length " + hl);
  const array = new Uint8Array(al);
  for (let ai = 0, hi = 0; ai < al; ai++, hi += 2) {
    const n1 = asciiToBase16(hex.charCodeAt(hi));
    const n2 = asciiToBase16(hex.charCodeAt(hi + 1));
    if (n1 === void 0 || n2 === void 0) {
      const char = hex[hi] + hex[hi + 1];
      throw new RangeError('hex string expected, got non-hex character "' + char + '" at index ' + hi);
    }
    array[ai] = n1 * 16 + n2;
  }
  return array;
}
function concatBytes(...arrays) {
  let sum = 0;
  for (let i = 0; i < arrays.length; i++) {
    const a = arrays[i];
    abytes(a);
    sum += a.length;
  }
  const res = new Uint8Array(sum);
  for (let i = 0, pad = 0; i < arrays.length; i++) {
    const a = arrays[i];
    res.set(a, pad);
    pad += a.length;
  }
  return res;
}
function checkOpts(defaults, opts, title = "opts") {
  aopts(defaults, "defaults");
  if (opts !== void 0)
    aopts(opts, title);
  const merged = Object.assign(/* @__PURE__ */ Object.create(null), defaults, opts);
  return merged;
}
function createHasher(hashCons, info2 = {}) {
  if (typeof hashCons !== "function")
    throw new TypeError('"hashCons" expected function, got type=' + typeof hashCons);
  info2 = checkOpts({}, info2, "info");
  const hashC = (msg, opts) => hashCons(opts).update(msg).digest();
  const tmp = hashCons(void 0);
  hashC.outputLen = tmp.outputLen;
  hashC.blockLen = tmp.blockLen;
  hashC.canXOF = tmp.canXOF;
  hashC.create = (opts) => hashCons(opts);
  Object.assign(hashC, info2);
  return Object.freeze(hashC);
}
function randomBytes(bytesLength = 32) {
  anumber(bytesLength, "bytesLength");
  const cr = typeof globalThis === "object" ? globalThis.crypto : null;
  if (typeof cr?.getRandomValues !== "function")
    throw new Error("crypto.getRandomValues must be defined");
  if (bytesLength > 65536)
    throw new RangeError(`"bytesLength" expected <= 65536, got ${bytesLength}`);
  return cr.getRandomValues(new Uint8Array(bytesLength));
}
var atitle, aobject, aopts, hasHexBuiltin, hexes, oidNist;
var init_utils = __esm({
  "../../node_modules/@noble/hashes/utils.js"() {
    "use strict";
    atitle = (title) => title ? `"${title}" ` : "";
    aobject = (value, label) => {
      if (value === null || typeof value !== "object" || Array.isArray(value))
        throw new TypeError((label === "object" ? "" : `"${label}" `) + "expected object, got type=" + typeof value);
    };
    aopts = (value, label) => {
      aobject(value, label);
      const proto = Object.getPrototypeOf(value);
      if (proto !== Object.prototype && proto !== null)
        throw new TypeError(`"${label}" expected plain object`);
      if (Object.hasOwn(value, "__proto__"))
        throw new TypeError(`"${label}.__proto__" is not allowed`);
    };
    hasHexBuiltin = /* @__PURE__ */ (() => (
      // @ts-ignore
      typeof Uint8Array.from([]).toHex === "function" && typeof Uint8Array.fromHex === "function"
    ))();
    hexes = /* @__PURE__ */ Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
    oidNist = (suffix) => ({
      // Current NIST hashAlgs suffixes used here fit in one DER subidentifier octet.
      // Larger suffix values would need base-128 OID encoding and a different length byte.
      oid: Uint8Array.from([6, 9, 96, 134, 72, 1, 101, 3, 4, 2, suffix])
    });
  }
});

// ../../node_modules/@noble/hashes/_md.js
function Chi(a, b, c) {
  return a & b ^ ~a & c;
}
function Maj(a, b, c) {
  return a & b ^ a & c ^ b & c;
}
var HashMD, SHA256_IV, SHA224_IV, SHA384_IV, SHA512_IV;
var init_md = __esm({
  "../../node_modules/@noble/hashes/_md.js"() {
    "use strict";
    init_u64();
    init_utils();
    HashMD = class {
      blockLen;
      outputLen;
      canXOF = false;
      padOffset;
      isLE;
      // For partial updates less than block size
      buffer;
      view;
      finished = false;
      length = 0;
      pos = 0;
      destroyed = false;
      constructor(blockLen, outputLen, padOffset, isLE2) {
        this.blockLen = blockLen;
        this.outputLen = outputLen;
        this.padOffset = padOffset;
        this.isLE = isLE2;
        this.buffer = new Uint8Array(blockLen);
        this.view = createView(this.buffer);
      }
      update(data2) {
        aexists(this);
        abytes(data2);
        const { view, buffer, blockLen } = this;
        const len = data2.length;
        let processed = false;
        for (let pos = 0; pos < len; ) {
          const take = Math.min(blockLen - this.pos, len - pos);
          if (take === blockLen) {
            const dataView = createView(data2);
            for (; blockLen <= len - pos; pos += blockLen)
              this.process(dataView, pos);
            processed = true;
            continue;
          }
          buffer.set(pos === 0 && take === len ? data2 : data2.subarray(pos, pos + take), this.pos);
          this.pos += take;
          pos += take;
          if (this.pos === blockLen) {
            this.process(view, 0);
            this.pos = 0;
            processed = true;
          }
        }
        this.length += data2.length;
        if (processed)
          this.roundClean();
        return this;
      }
      digestInto(out) {
        aexists(this);
        aoutput(out, this);
        this.finished = true;
        const { buffer, view, blockLen, isLE: isLE2 } = this;
        let { pos } = this;
        buffer[pos++] = 128;
        buffer.fill(0, pos);
        if (this.padOffset > blockLen - pos) {
          this.process(view, 0);
          buffer.fill(0);
        }
        setU64FromNum(view, blockLen - 8, this.length * 8, isLE2);
        this.process(view, 0);
        this.roundClean();
        const oview = out === buffer ? view : createView(out);
        const len = this.outputLen;
        const outLen = len / 4;
        const state = this.get();
        if (len % 4 || outLen > state.length)
          throw new Error("invalid outputLen");
        for (let i = 0; i < outLen; i++)
          oview.setUint32(4 * i, state[i], isLE2);
      }
      digest() {
        const { buffer, outputLen } = this;
        this.digestInto(buffer);
        const res = buffer.slice(0, outputLen);
        this.destroy();
        return res;
      }
      _cloneIntoMeta(to) {
        const { buffer, length, finished, destroyed, pos } = this;
        to.destroyed = destroyed;
        to.finished = finished;
        to.length = length;
        to.pos = pos;
        if (pos)
          to.buffer.set(buffer);
        return to;
      }
      clone() {
        return this._cloneInto();
      }
    };
    SHA256_IV = /* @__PURE__ */ Uint32Array.from([
      1779033703,
      3144134277,
      1013904242,
      2773480762,
      1359893119,
      2600822924,
      528734635,
      1541459225
    ]);
    SHA224_IV = /* @__PURE__ */ Uint32Array.from([
      3238371032,
      914150663,
      812702999,
      4144912697,
      4290775857,
      1750603025,
      1694076839,
      3204075428
    ]);
    SHA384_IV = /* @__PURE__ */ Uint32Array.from([
      3418070365,
      3238371032,
      1654270250,
      914150663,
      2438529370,
      812702999,
      355462360,
      4144912697,
      1731405415,
      4290775857,
      2394180231,
      1750603025,
      3675008525,
      1694076839,
      1203062813,
      3204075428
    ]);
    SHA512_IV = /* @__PURE__ */ Uint32Array.from([
      1779033703,
      4089235720,
      3144134277,
      2227873595,
      1013904242,
      4271175723,
      2773480762,
      1595750129,
      1359893119,
      2917565137,
      2600822924,
      725511199,
      528734635,
      4215389547,
      1541459225,
      327033209
    ]);
  }
});

// ../../node_modules/@noble/hashes/sha2.js
var sha2_exports = {};
__export(sha2_exports, {
  _SHA224: () => _SHA224,
  _SHA256: () => _SHA256,
  _SHA384: () => _SHA384,
  _SHA512: () => _SHA512,
  _SHA512_224: () => _SHA512_224,
  _SHA512_256: () => _SHA512_256,
  sha224: () => sha2242,
  sha256: () => sha2562,
  sha384: () => sha3842,
  sha512: () => sha5122,
  sha512_224: () => sha512_224,
  sha512_256: () => sha512_256
});
var SHA256_K, SHA256_W, SHA2_32B, _SHA256, _SHA224, K512, SHA512_Kh, SHA512_Kl, SHA512_W_H, SHA512_W_L, SHA2_64B, _SHA512, _SHA384, T224_IV, T256_IV, _SHA512_224, _SHA512_256, sha2562, sha2242, sha5122, sha3842, sha512_256, sha512_224;
var init_sha2 = __esm({
  "../../node_modules/@noble/hashes/sha2.js"() {
    "use strict";
    init_md();
    init_u64();
    init_utils();
    SHA256_K = /* @__PURE__ */ Uint32Array.from([
      1116352408,
      1899447441,
      3049323471,
      3921009573,
      961987163,
      1508970993,
      2453635748,
      2870763221,
      3624381080,
      310598401,
      607225278,
      1426881987,
      1925078388,
      2162078206,
      2614888103,
      3248222580,
      3835390401,
      4022224774,
      264347078,
      604807628,
      770255983,
      1249150122,
      1555081692,
      1996064986,
      2554220882,
      2821834349,
      2952996808,
      3210313671,
      3336571891,
      3584528711,
      113926993,
      338241895,
      666307205,
      773529912,
      1294757372,
      1396182291,
      1695183700,
      1986661051,
      2177026350,
      2456956037,
      2730485921,
      2820302411,
      3259730800,
      3345764771,
      3516065817,
      3600352804,
      4094571909,
      275423344,
      430227734,
      506948616,
      659060556,
      883997877,
      958139571,
      1322822218,
      1537002063,
      1747873779,
      1955562222,
      2024104815,
      2227730452,
      2361852424,
      2428436474,
      2756734187,
      3204031479,
      3329325298
    ]);
    SHA256_W = /* @__PURE__ */ new Uint32Array(64);
    SHA2_32B = class extends HashMD {
      // We cannot use array here since array allows indexing by variable
      // which means optimizer/compiler cannot use registers.
      // Numeric initializers matter: starting the fields as `undefined` changes
      // V8's field representation and makes sha256 3x slower (measured).
      A = 0;
      B = 0;
      C = 0;
      D = 0;
      E = 0;
      F = 0;
      G = 0;
      H = 0;
      constructor(outputLen, IV) {
        super(64, outputLen, 8, false);
        this.A = IV[0] | 0;
        this.B = IV[1] | 0;
        this.C = IV[2] | 0;
        this.D = IV[3] | 0;
        this.E = IV[4] | 0;
        this.F = IV[5] | 0;
        this.G = IV[6] | 0;
        this.H = IV[7] | 0;
      }
      get() {
        const { A, B, C, D, E, F, G, H } = this;
        return [A, B, C, D, E, F, G, H];
      }
      // prettier-ignore
      set(A, B, C, D, E, F, G, H) {
        this.A = A | 0;
        this.B = B | 0;
        this.C = C | 0;
        this.D = D | 0;
        this.E = E | 0;
        this.F = F | 0;
        this.G = G | 0;
        this.H = H | 0;
      }
      _cloneInto(to) {
        (to ||= new this.constructor()).set(...this.get());
        return this._cloneIntoMeta(to);
      }
      process(view, offset) {
        for (let i = 0; i < 16; i++, offset += 4)
          SHA256_W[i] = view.getUint32(offset, false);
        for (let i = 16; i < 64; i++) {
          const W15 = SHA256_W[i - 15];
          const W2 = SHA256_W[i - 2];
          const s0 = rotr(W15, 7) ^ rotr(W15, 18) ^ W15 >>> 3;
          const s1 = rotr(W2, 17) ^ rotr(W2, 19) ^ W2 >>> 10;
          SHA256_W[i] = s1 + SHA256_W[i - 7] + s0 + SHA256_W[i - 16] | 0;
        }
        let { A, B, C, D, E, F, G, H } = this;
        for (let i = 0; i < 64; i++) {
          const sigma1 = rotr(E, 6) ^ rotr(E, 11) ^ rotr(E, 25);
          const T1 = H + sigma1 + Chi(E, F, G) + SHA256_K[i] + SHA256_W[i] | 0;
          const sigma0 = rotr(A, 2) ^ rotr(A, 13) ^ rotr(A, 22);
          const T2 = sigma0 + Maj(A, B, C) | 0;
          H = G;
          G = F;
          F = E;
          E = D + T1 | 0;
          D = C;
          C = B;
          B = A;
          A = T1 + T2 | 0;
        }
        A = A + this.A | 0;
        B = B + this.B | 0;
        C = C + this.C | 0;
        D = D + this.D | 0;
        E = E + this.E | 0;
        F = F + this.F | 0;
        G = G + this.G | 0;
        H = H + this.H | 0;
        this.set(A, B, C, D, E, F, G, H);
      }
      roundClean() {
        clean(SHA256_W);
      }
      destroy() {
        this.destroyed = true;
        this.set(0, 0, 0, 0, 0, 0, 0, 0);
        clean(this.buffer);
      }
    };
    _SHA256 = class extends SHA2_32B {
      constructor() {
        super(32, SHA256_IV);
      }
    };
    _SHA224 = class extends SHA2_32B {
      constructor() {
        super(28, SHA224_IV);
      }
    };
    K512 = /* @__PURE__ */ (() => split([
      "0x428a2f98d728ae22",
      "0x7137449123ef65cd",
      "0xb5c0fbcfec4d3b2f",
      "0xe9b5dba58189dbbc",
      "0x3956c25bf348b538",
      "0x59f111f1b605d019",
      "0x923f82a4af194f9b",
      "0xab1c5ed5da6d8118",
      "0xd807aa98a3030242",
      "0x12835b0145706fbe",
      "0x243185be4ee4b28c",
      "0x550c7dc3d5ffb4e2",
      "0x72be5d74f27b896f",
      "0x80deb1fe3b1696b1",
      "0x9bdc06a725c71235",
      "0xc19bf174cf692694",
      "0xe49b69c19ef14ad2",
      "0xefbe4786384f25e3",
      "0x0fc19dc68b8cd5b5",
      "0x240ca1cc77ac9c65",
      "0x2de92c6f592b0275",
      "0x4a7484aa6ea6e483",
      "0x5cb0a9dcbd41fbd4",
      "0x76f988da831153b5",
      "0x983e5152ee66dfab",
      "0xa831c66d2db43210",
      "0xb00327c898fb213f",
      "0xbf597fc7beef0ee4",
      "0xc6e00bf33da88fc2",
      "0xd5a79147930aa725",
      "0x06ca6351e003826f",
      "0x142929670a0e6e70",
      "0x27b70a8546d22ffc",
      "0x2e1b21385c26c926",
      "0x4d2c6dfc5ac42aed",
      "0x53380d139d95b3df",
      "0x650a73548baf63de",
      "0x766a0abb3c77b2a8",
      "0x81c2c92e47edaee6",
      "0x92722c851482353b",
      "0xa2bfe8a14cf10364",
      "0xa81a664bbc423001",
      "0xc24b8b70d0f89791",
      "0xc76c51a30654be30",
      "0xd192e819d6ef5218",
      "0xd69906245565a910",
      "0xf40e35855771202a",
      "0x106aa07032bbd1b8",
      "0x19a4c116b8d2d0c8",
      "0x1e376c085141ab53",
      "0x2748774cdf8eeb99",
      "0x34b0bcb5e19b48a8",
      "0x391c0cb3c5c95a63",
      "0x4ed8aa4ae3418acb",
      "0x5b9cca4f7763e373",
      "0x682e6ff3d6b2b8a3",
      "0x748f82ee5defb2fc",
      "0x78a5636f43172f60",
      "0x84c87814a1f0ab72",
      "0x8cc702081a6439ec",
      "0x90befffa23631e28",
      "0xa4506cebde82bde9",
      "0xbef9a3f7b2c67915",
      "0xc67178f2e372532b",
      "0xca273eceea26619c",
      "0xd186b8c721c0c207",
      "0xeada7dd6cde0eb1e",
      "0xf57d4f7fee6ed178",
      "0x06f067aa72176fba",
      "0x0a637dc5a2c898a6",
      "0x113f9804bef90dae",
      "0x1b710b35131c471b",
      "0x28db77f523047d84",
      "0x32caab7b40c72493",
      "0x3c9ebe0a15c9bebc",
      "0x431d67c49c100d4c",
      "0x4cc5d4becb3e42b6",
      "0x597f299cfc657e2a",
      "0x5fcb6fab3ad6faec",
      "0x6c44198c4a475817"
    ].map((n) => BigInt(n))))();
    SHA512_Kh = /* @__PURE__ */ (() => K512[0])();
    SHA512_Kl = /* @__PURE__ */ (() => K512[1])();
    SHA512_W_H = /* @__PURE__ */ new Uint32Array(80);
    SHA512_W_L = /* @__PURE__ */ new Uint32Array(80);
    SHA2_64B = class extends HashMD {
      // We cannot use array here since array allows indexing by variable
      // which means optimizer/compiler cannot use registers.
      // h -- high 32 bits, l -- low 32 bits
      // Numeric initializers matter: starting the fields as `undefined` changes
      // V8's field representation and slows hashing down (measured on sha256).
      Ah = 0;
      Al = 0;
      Bh = 0;
      Bl = 0;
      Ch = 0;
      Cl = 0;
      Dh = 0;
      Dl = 0;
      Eh = 0;
      El = 0;
      Fh = 0;
      Fl = 0;
      Gh = 0;
      Gl = 0;
      Hh = 0;
      Hl = 0;
      constructor(outputLen, IV) {
        super(128, outputLen, 16, false);
        this.Ah = IV[0] | 0;
        this.Al = IV[1] | 0;
        this.Bh = IV[2] | 0;
        this.Bl = IV[3] | 0;
        this.Ch = IV[4] | 0;
        this.Cl = IV[5] | 0;
        this.Dh = IV[6] | 0;
        this.Dl = IV[7] | 0;
        this.Eh = IV[8] | 0;
        this.El = IV[9] | 0;
        this.Fh = IV[10] | 0;
        this.Fl = IV[11] | 0;
        this.Gh = IV[12] | 0;
        this.Gl = IV[13] | 0;
        this.Hh = IV[14] | 0;
        this.Hl = IV[15] | 0;
      }
      // prettier-ignore
      get() {
        const { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
        return [Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl];
      }
      // prettier-ignore
      set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl) {
        this.Ah = Ah | 0;
        this.Al = Al | 0;
        this.Bh = Bh | 0;
        this.Bl = Bl | 0;
        this.Ch = Ch | 0;
        this.Cl = Cl | 0;
        this.Dh = Dh | 0;
        this.Dl = Dl | 0;
        this.Eh = Eh | 0;
        this.El = El | 0;
        this.Fh = Fh | 0;
        this.Fl = Fl | 0;
        this.Gh = Gh | 0;
        this.Gl = Gl | 0;
        this.Hh = Hh | 0;
        this.Hl = Hl | 0;
      }
      _cloneInto(to) {
        (to ||= new this.constructor()).set(...this.get());
        return this._cloneIntoMeta(to);
      }
      process(view, offset) {
        for (let i = 0; i < 16; i++, offset += 4) {
          SHA512_W_H[i] = view.getUint32(offset);
          SHA512_W_L[i] = view.getUint32(offset += 4);
        }
        for (let i = 16; i < 80; i++) {
          const W15h = SHA512_W_H[i - 15] | 0;
          const W15l = SHA512_W_L[i - 15] | 0;
          const s0h = rotrSH(W15h, W15l, 1) ^ rotrSH(W15h, W15l, 8) ^ shrSH(W15h, W15l, 7);
          const s0l = rotrSL(W15h, W15l, 1) ^ rotrSL(W15h, W15l, 8) ^ shrSL(W15h, W15l, 7);
          const W2h = SHA512_W_H[i - 2] | 0;
          const W2l = SHA512_W_L[i - 2] | 0;
          const s1h = rotrSH(W2h, W2l, 19) ^ rotrBH(W2h, W2l, 61) ^ shrSH(W2h, W2l, 6);
          const s1l = rotrSL(W2h, W2l, 19) ^ rotrBL(W2h, W2l, 61) ^ shrSL(W2h, W2l, 6);
          const SUMl = add4L(s0l, s1l, SHA512_W_L[i - 7], SHA512_W_L[i - 16]);
          const SUMh = add4H(SUMl, s0h, s1h, SHA512_W_H[i - 7], SHA512_W_H[i - 16]);
          SHA512_W_H[i] = SUMh | 0;
          SHA512_W_L[i] = SUMl | 0;
        }
        let { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
        for (let i = 0; i < 80; i++) {
          const sigma1h = rotrSH(Eh, El, 14) ^ rotrSH(Eh, El, 18) ^ rotrBH(Eh, El, 41);
          const sigma1l = rotrSL(Eh, El, 14) ^ rotrSL(Eh, El, 18) ^ rotrBL(Eh, El, 41);
          const CHIh = Eh & Fh ^ ~Eh & Gh;
          const CHIl = El & Fl ^ ~El & Gl;
          const T1ll = add5L(Hl, sigma1l, CHIl, SHA512_Kl[i], SHA512_W_L[i]);
          const T1h = add5H(T1ll, Hh, sigma1h, CHIh, SHA512_Kh[i], SHA512_W_H[i]);
          const T1l = T1ll | 0;
          const sigma0h = rotrSH(Ah, Al, 28) ^ rotrBH(Ah, Al, 34) ^ rotrBH(Ah, Al, 39);
          const sigma0l = rotrSL(Ah, Al, 28) ^ rotrBL(Ah, Al, 34) ^ rotrBL(Ah, Al, 39);
          const MAJh = Ah & Bh ^ Ah & Ch ^ Bh & Ch;
          const MAJl = Al & Bl ^ Al & Cl ^ Bl & Cl;
          Hh = Gh | 0;
          Hl = Gl | 0;
          Gh = Fh | 0;
          Gl = Fl | 0;
          Fh = Eh | 0;
          Fl = El | 0;
          ({ h: Eh, l: El } = add(Dh | 0, Dl | 0, T1h | 0, T1l | 0));
          Dh = Ch | 0;
          Dl = Cl | 0;
          Ch = Bh | 0;
          Cl = Bl | 0;
          Bh = Ah | 0;
          Bl = Al | 0;
          const All = add3L(T1l, sigma0l, MAJl);
          Ah = add3H(All, T1h, sigma0h, MAJh);
          Al = All | 0;
        }
        ({ h: Ah, l: Al } = add(this.Ah | 0, this.Al | 0, Ah | 0, Al | 0));
        ({ h: Bh, l: Bl } = add(this.Bh | 0, this.Bl | 0, Bh | 0, Bl | 0));
        ({ h: Ch, l: Cl } = add(this.Ch | 0, this.Cl | 0, Ch | 0, Cl | 0));
        ({ h: Dh, l: Dl } = add(this.Dh | 0, this.Dl | 0, Dh | 0, Dl | 0));
        ({ h: Eh, l: El } = add(this.Eh | 0, this.El | 0, Eh | 0, El | 0));
        ({ h: Fh, l: Fl } = add(this.Fh | 0, this.Fl | 0, Fh | 0, Fl | 0));
        ({ h: Gh, l: Gl } = add(this.Gh | 0, this.Gl | 0, Gh | 0, Gl | 0));
        ({ h: Hh, l: Hl } = add(this.Hh | 0, this.Hl | 0, Hh | 0, Hl | 0));
        this.set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl);
      }
      roundClean() {
        clean(SHA512_W_H, SHA512_W_L);
      }
      destroy() {
        this.destroyed = true;
        clean(this.buffer);
        this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
      }
    };
    _SHA512 = class extends SHA2_64B {
      constructor() {
        super(64, SHA512_IV);
      }
    };
    _SHA384 = class extends SHA2_64B {
      constructor() {
        super(48, SHA384_IV);
      }
    };
    T224_IV = /* @__PURE__ */ Uint32Array.from([
      2352822216,
      424955298,
      1944164710,
      2312950998,
      502970286,
      855612546,
      1738396948,
      1479516111,
      258812777,
      2077511080,
      2011393907,
      79989058,
      1067287976,
      1780299464,
      286451373,
      2446758561
    ]);
    T256_IV = /* @__PURE__ */ Uint32Array.from([
      573645204,
      4230739756,
      2673172387,
      3360449730,
      596883563,
      1867755857,
      2520282905,
      1497426621,
      2519219938,
      2827943907,
      3193839141,
      1401305490,
      721525244,
      746961066,
      246885852,
      2177182882
    ]);
    _SHA512_224 = class extends SHA2_64B {
      constructor() {
        super(28, T224_IV);
      }
    };
    _SHA512_256 = class extends SHA2_64B {
      constructor() {
        super(32, T256_IV);
      }
    };
    sha2562 = /* @__PURE__ */ createHasher(
      () => new _SHA256(),
      /* @__PURE__ */ oidNist(1)
    );
    sha2242 = /* @__PURE__ */ createHasher(
      () => new _SHA224(),
      /* @__PURE__ */ oidNist(4)
    );
    sha5122 = /* @__PURE__ */ createHasher(
      () => new _SHA512(),
      /* @__PURE__ */ oidNist(3)
    );
    sha3842 = /* @__PURE__ */ createHasher(
      () => new _SHA384(),
      /* @__PURE__ */ oidNist(2)
    );
    sha512_256 = /* @__PURE__ */ createHasher(
      () => new _SHA512_256(),
      /* @__PURE__ */ oidNist(6)
    );
    sha512_224 = /* @__PURE__ */ createHasher(
      () => new _SHA512_224(),
      /* @__PURE__ */ oidNist(5)
    );
  }
});

// ../../node_modules/@xmldom/xmldom/lib/conventions.js
var require_conventions = __commonJS({
  "../../node_modules/@xmldom/xmldom/lib/conventions.js"(exports) {
    "use strict";
    function find(list, predicate, ac) {
      if (ac === void 0) {
        ac = Array.prototype;
      }
      if (list && typeof ac.find === "function") {
        return ac.find.call(list, predicate);
      }
      for (var i = 0; i < list.length; i++) {
        if (Object.prototype.hasOwnProperty.call(list, i)) {
          var item = list[i];
          if (predicate.call(void 0, item, i, list)) {
            return item;
          }
        }
      }
    }
    function freeze(object, oc) {
      if (oc === void 0) {
        oc = Object;
      }
      return oc && typeof oc.freeze === "function" ? oc.freeze(object) : object;
    }
    var MIME_TYPE = freeze({
      /**
       * `text/html`, the only mime type that triggers treating an XML document as HTML.
       *
       * @see DOMParser.SupportedType.isHTML
       * @see https://www.iana.org/assignments/media-types/text/html IANA MimeType registration
       * @see https://en.wikipedia.org/wiki/HTML Wikipedia
       * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/parseFromString MDN
       * @see https://html.spec.whatwg.org/multipage/dynamic-markup-insertion.html#dom-domparser-parsefromstring WHATWG HTML Spec
       */
      HTML: "text/html",
      /**
       * Helper method to check a mime type if it indicates an HTML document
       *
       * @param {string} [value]
       * @returns {boolean}
       *
       * @see https://www.iana.org/assignments/media-types/text/html IANA MimeType registration
       * @see https://en.wikipedia.org/wiki/HTML Wikipedia
       * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/parseFromString MDN
       * @see https://html.spec.whatwg.org/multipage/dynamic-markup-insertion.html#dom-domparser-parsefromstring 	 */
      isHTML: function(value) {
        return value === MIME_TYPE.HTML;
      },
      /**
       * `application/xml`, the standard mime type for XML documents.
       *
       * @see https://www.iana.org/assignments/media-types/application/xml IANA MimeType registration
       * @see https://tools.ietf.org/html/rfc7303#section-9.1 RFC 7303
       * @see https://en.wikipedia.org/wiki/XML_and_MIME Wikipedia
       */
      XML_APPLICATION: "application/xml",
      /**
       * `text/html`, an alias for `application/xml`.
       *
       * @see https://tools.ietf.org/html/rfc7303#section-9.2 RFC 7303
       * @see https://www.iana.org/assignments/media-types/text/xml IANA MimeType registration
       * @see https://en.wikipedia.org/wiki/XML_and_MIME Wikipedia
       */
      XML_TEXT: "text/xml",
      /**
       * `application/xhtml+xml`, indicates an XML document that has the default HTML namespace,
       * but is parsed as an XML document.
       *
       * @see https://www.iana.org/assignments/media-types/application/xhtml+xml IANA MimeType registration
       * @see https://dom.spec.whatwg.org/#dom-domimplementation-createdocument WHATWG DOM Spec
       * @see https://en.wikipedia.org/wiki/XHTML Wikipedia
       */
      XML_XHTML_APPLICATION: "application/xhtml+xml",
      /**
       * `image/svg+xml`,
       *
       * @see https://www.iana.org/assignments/media-types/image/svg+xml IANA MimeType registration
       * @see https://www.w3.org/TR/SVG11/ W3C SVG 1.1
       * @see https://en.wikipedia.org/wiki/Scalable_Vector_Graphics Wikipedia
       */
      XML_SVG_IMAGE: "image/svg+xml"
    });
    var NAMESPACE = freeze({
      /**
       * The XHTML namespace.
       *
       * @see http://www.w3.org/1999/xhtml
       */
      HTML: "http://www.w3.org/1999/xhtml",
      /**
       * Checks if `uri` equals `NAMESPACE.HTML`.
       *
       * @param {string} [uri]
       *
       * @see NAMESPACE.HTML
       */
      isHTML: function(uri) {
        return uri === NAMESPACE.HTML;
      },
      /**
       * The SVG namespace.
       *
       * @see http://www.w3.org/2000/svg
       */
      SVG: "http://www.w3.org/2000/svg",
      /**
       * The `xml:` namespace.
       *
       * @see http://www.w3.org/XML/1998/namespace
       */
      XML: "http://www.w3.org/XML/1998/namespace",
      /**
       * The `xmlns:` namespace
       *
       * @see https://www.w3.org/2000/xmlns/
       */
      XMLNS: "http://www.w3.org/2000/xmlns/"
    });
    exports.find = find;
    exports.freeze = freeze;
    exports.MIME_TYPE = MIME_TYPE;
    exports.NAMESPACE = NAMESPACE;
  }
});

// ../../node_modules/@xmldom/xmldom/lib/dom.js
var require_dom = __commonJS({
  "../../node_modules/@xmldom/xmldom/lib/dom.js"(exports) {
    "use strict";
    var conventions = require_conventions();
    var find = conventions.find;
    var NAMESPACE = conventions.NAMESPACE;
    function notEmptyString(input) {
      return input !== "";
    }
    function splitOnASCIIWhitespace(input) {
      return input ? input.split(/[\t\n\f\r ]+/).filter(notEmptyString) : [];
    }
    function orderedSetReducer(current, element) {
      if (!current.hasOwnProperty(element)) {
        current[element] = true;
      }
      return current;
    }
    function toOrderedSet(input) {
      if (!input) return [];
      var list = splitOnASCIIWhitespace(input);
      return Object.keys(list.reduce(orderedSetReducer, {}));
    }
    function arrayIncludes(list) {
      return function(element) {
        return list && list.indexOf(element) !== -1;
      };
    }
    function copy(src, dest) {
      for (var p in src) {
        if (Object.prototype.hasOwnProperty.call(src, p)) {
          dest[p] = src[p];
        }
      }
    }
    function _extends(Class, Super) {
      var pt = Class.prototype;
      if (!(pt instanceof Super)) {
        let t2 = function() {
        };
        var t = t2;
        ;
        t2.prototype = Super.prototype;
        t2 = new t2();
        copy(pt, t2);
        Class.prototype = pt = t2;
      }
      if (pt.constructor != Class) {
        if (typeof Class != "function") {
          console.error("unknown Class:" + Class);
        }
        pt.constructor = Class;
      }
    }
    var NodeType = {};
    var ELEMENT_NODE = NodeType.ELEMENT_NODE = 1;
    var ATTRIBUTE_NODE = NodeType.ATTRIBUTE_NODE = 2;
    var TEXT_NODE = NodeType.TEXT_NODE = 3;
    var CDATA_SECTION_NODE = NodeType.CDATA_SECTION_NODE = 4;
    var ENTITY_REFERENCE_NODE = NodeType.ENTITY_REFERENCE_NODE = 5;
    var ENTITY_NODE = NodeType.ENTITY_NODE = 6;
    var PROCESSING_INSTRUCTION_NODE = NodeType.PROCESSING_INSTRUCTION_NODE = 7;
    var COMMENT_NODE = NodeType.COMMENT_NODE = 8;
    var DOCUMENT_NODE = NodeType.DOCUMENT_NODE = 9;
    var DOCUMENT_TYPE_NODE = NodeType.DOCUMENT_TYPE_NODE = 10;
    var DOCUMENT_FRAGMENT_NODE = NodeType.DOCUMENT_FRAGMENT_NODE = 11;
    var NOTATION_NODE = NodeType.NOTATION_NODE = 12;
    var ExceptionCode = {};
    var ExceptionMessage = {};
    var INDEX_SIZE_ERR = ExceptionCode.INDEX_SIZE_ERR = (ExceptionMessage[1] = "Index size error", 1);
    var DOMSTRING_SIZE_ERR = ExceptionCode.DOMSTRING_SIZE_ERR = (ExceptionMessage[2] = "DOMString size error", 2);
    var HIERARCHY_REQUEST_ERR = ExceptionCode.HIERARCHY_REQUEST_ERR = (ExceptionMessage[3] = "Hierarchy request error", 3);
    var WRONG_DOCUMENT_ERR = ExceptionCode.WRONG_DOCUMENT_ERR = (ExceptionMessage[4] = "Wrong document", 4);
    var INVALID_CHARACTER_ERR = ExceptionCode.INVALID_CHARACTER_ERR = (ExceptionMessage[5] = "Invalid character", 5);
    var NO_DATA_ALLOWED_ERR = ExceptionCode.NO_DATA_ALLOWED_ERR = (ExceptionMessage[6] = "No data allowed", 6);
    var NO_MODIFICATION_ALLOWED_ERR = ExceptionCode.NO_MODIFICATION_ALLOWED_ERR = (ExceptionMessage[7] = "No modification allowed", 7);
    var NOT_FOUND_ERR = ExceptionCode.NOT_FOUND_ERR = (ExceptionMessage[8] = "Not found", 8);
    var NOT_SUPPORTED_ERR = ExceptionCode.NOT_SUPPORTED_ERR = (ExceptionMessage[9] = "Not supported", 9);
    var INUSE_ATTRIBUTE_ERR = ExceptionCode.INUSE_ATTRIBUTE_ERR = (ExceptionMessage[10] = "Attribute in use", 10);
    var INVALID_STATE_ERR = ExceptionCode.INVALID_STATE_ERR = (ExceptionMessage[11] = "Invalid state", 11);
    var SYNTAX_ERR = ExceptionCode.SYNTAX_ERR = (ExceptionMessage[12] = "Syntax error", 12);
    var INVALID_MODIFICATION_ERR = ExceptionCode.INVALID_MODIFICATION_ERR = (ExceptionMessage[13] = "Invalid modification", 13);
    var NAMESPACE_ERR = ExceptionCode.NAMESPACE_ERR = (ExceptionMessage[14] = "Invalid namespace", 14);
    var INVALID_ACCESS_ERR = ExceptionCode.INVALID_ACCESS_ERR = (ExceptionMessage[15] = "Invalid access", 15);
    function DOMException(code, message) {
      if (message instanceof Error) {
        var error2 = message;
      } else {
        error2 = this;
        Error.call(this, ExceptionMessage[code]);
        this.message = ExceptionMessage[code];
        if (Error.captureStackTrace) Error.captureStackTrace(this, DOMException);
      }
      error2.code = code;
      if (message) this.message = this.message + ": " + message;
      return error2;
    }
    DOMException.prototype = Error.prototype;
    copy(ExceptionCode, DOMException);
    function NodeList() {
    }
    NodeList.prototype = {
      /**
       * The number of nodes in the list. The range of valid child node indices is 0 to length-1 inclusive.
       * @standard level1
       */
      length: 0,
      /**
       * Returns the indexth item in the collection. If index is greater than or equal to the number of nodes in the list, this returns null.
       * @standard level1
       * @param index  unsigned long
       *   Index into the collection.
       * @return Node
       * 	The node at the indexth position in the NodeList, or null if that is not a valid index.
       */
      item: function(index) {
        return index >= 0 && index < this.length ? this[index] : null;
      },
      toString: function(isHTML, nodeFilter) {
        for (var buf = [], i = 0; i < this.length; i++) {
          serializeToString(this[i], buf, isHTML, nodeFilter);
        }
        return buf.join("");
      },
      /**
       * @private
       * @param {function (Node):boolean} predicate
       * @returns {Node[]}
       */
      filter: function(predicate) {
        return Array.prototype.filter.call(this, predicate);
      },
      /**
       * @private
       * @param {Node} item
       * @returns {number}
       */
      indexOf: function(item) {
        return Array.prototype.indexOf.call(this, item);
      }
    };
    function LiveNodeList(node, refresh) {
      this._node = node;
      this._refresh = refresh;
      _updateLiveList(this);
    }
    function _updateLiveList(list) {
      var inc = list._node._inc || list._node.ownerDocument._inc;
      if (list._inc !== inc) {
        var ls = list._refresh(list._node);
        __set__(list, "length", ls.length);
        if (!list.$$length || ls.length < list.$$length) {
          for (var i = ls.length; i in list; i++) {
            if (Object.prototype.hasOwnProperty.call(list, i)) {
              delete list[i];
            }
          }
        }
        copy(ls, list);
        list._inc = inc;
      }
    }
    LiveNodeList.prototype.item = function(i) {
      _updateLiveList(this);
      return this[i] || null;
    };
    _extends(LiveNodeList, NodeList);
    function NamedNodeMap() {
    }
    function _findNodeIndex(list, node) {
      var i = list.length;
      while (i--) {
        if (list[i] === node) {
          return i;
        }
      }
    }
    function _addNamedNode(el, list, newAttr, oldAttr) {
      if (oldAttr) {
        list[_findNodeIndex(list, oldAttr)] = newAttr;
      } else {
        list[list.length++] = newAttr;
      }
      if (el) {
        newAttr.ownerElement = el;
        var doc = el.ownerDocument;
        if (doc) {
          oldAttr && _onRemoveAttribute(doc, el, oldAttr);
          _onAddAttribute(doc, el, newAttr);
        }
      }
    }
    function _removeNamedNode(el, list, attr) {
      var i = _findNodeIndex(list, attr);
      if (i >= 0) {
        var lastIndex = list.length - 1;
        while (i < lastIndex) {
          list[i] = list[++i];
        }
        list.length = lastIndex;
        if (el) {
          var doc = el.ownerDocument;
          if (doc) {
            _onRemoveAttribute(doc, el, attr);
            attr.ownerElement = null;
          }
        }
      } else {
        throw new DOMException(NOT_FOUND_ERR, new Error(el.tagName + "@" + attr));
      }
    }
    NamedNodeMap.prototype = {
      length: 0,
      item: NodeList.prototype.item,
      getNamedItem: function(key) {
        var i = this.length;
        while (i--) {
          var attr = this[i];
          if (attr.nodeName == key) {
            return attr;
          }
        }
      },
      setNamedItem: function(attr) {
        var el = attr.ownerElement;
        if (el && el != this._ownerElement) {
          throw new DOMException(INUSE_ATTRIBUTE_ERR);
        }
        var oldAttr = this.getNamedItem(attr.nodeName);
        _addNamedNode(this._ownerElement, this, attr, oldAttr);
        return oldAttr;
      },
      /* returns Node */
      setNamedItemNS: function(attr) {
        var el = attr.ownerElement, oldAttr;
        if (el && el != this._ownerElement) {
          throw new DOMException(INUSE_ATTRIBUTE_ERR);
        }
        oldAttr = this.getNamedItemNS(attr.namespaceURI, attr.localName);
        _addNamedNode(this._ownerElement, this, attr, oldAttr);
        return oldAttr;
      },
      /* returns Node */
      removeNamedItem: function(key) {
        var attr = this.getNamedItem(key);
        _removeNamedNode(this._ownerElement, this, attr);
        return attr;
      },
      // raises: NOT_FOUND_ERR,NO_MODIFICATION_ALLOWED_ERR
      //for level2
      removeNamedItemNS: function(namespaceURI, localName) {
        var attr = this.getNamedItemNS(namespaceURI, localName);
        _removeNamedNode(this._ownerElement, this, attr);
        return attr;
      },
      getNamedItemNS: function(namespaceURI, localName) {
        var i = this.length;
        while (i--) {
          var node = this[i];
          if (node.localName == localName && node.namespaceURI == namespaceURI) {
            return node;
          }
        }
        return null;
      }
    };
    function DOMImplementation() {
    }
    DOMImplementation.prototype = {
      /**
       * The DOMImplementation.hasFeature() method returns a Boolean flag indicating if a given feature is supported.
       * The different implementations fairly diverged in what kind of features were reported.
       * The latest version of the spec settled to force this method to always return true, where the functionality was accurate and in use.
       *
       * @deprecated It is deprecated and modern browsers return true in all cases.
       *
       * @param {string} feature
       * @param {string} [version]
       * @returns {boolean} always true
       *
       * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMImplementation/hasFeature MDN
       * @see https://www.w3.org/TR/REC-DOM-Level-1/level-one-core.html#ID-5CED94D7 DOM Level 1 Core
       * @see https://dom.spec.whatwg.org/#dom-domimplementation-hasfeature DOM Living Standard
       */
      hasFeature: function(feature, version2) {
        return true;
      },
      /**
       * Creates an XML Document object of the specified type with its document element.
       *
       * __It behaves slightly different from the description in the living standard__:
       * - There is no interface/class `XMLDocument`, it returns a `Document` instance.
       * - `contentType`, `encoding`, `mode`, `origin`, `url` fields are currently not declared.
       * - this implementation is not validating names or qualified names
       *   (when parsing XML strings, the SAX parser takes care of that)
       *
       * @param {string|null} namespaceURI
       * @param {string} qualifiedName
       * @param {DocumentType=null} doctype
       * @returns {Document}
       *
       * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMImplementation/createDocument MDN
       * @see https://www.w3.org/TR/DOM-Level-2-Core/core.html#Level-2-Core-DOM-createDocument DOM Level 2 Core (initial)
       * @see https://dom.spec.whatwg.org/#dom-domimplementation-createdocument  DOM Level 2 Core
       *
       * @see https://dom.spec.whatwg.org/#validate-and-extract DOM: Validate and extract
       * @see https://www.w3.org/TR/xml/#NT-NameStartChar XML Spec: Names
       * @see https://www.w3.org/TR/xml-names/#ns-qualnames XML Namespaces: Qualified names
       */
      createDocument: function(namespaceURI, qualifiedName, doctype) {
        var doc = new Document();
        doc.implementation = this;
        doc.childNodes = new NodeList();
        doc.doctype = doctype || null;
        if (doctype) {
          doc.appendChild(doctype);
        }
        if (qualifiedName) {
          var root = doc.createElementNS(namespaceURI, qualifiedName);
          doc.appendChild(root);
        }
        return doc;
      },
      /**
       * Returns a doctype, with the given `qualifiedName`, `publicId`, and `systemId`.
       *
       * __This behavior is slightly different from the in the specs__:
       * - this implementation is not validating names or qualified names
       *   (when parsing XML strings, the SAX parser takes care of that)
       *
       * @param {string} qualifiedName
       * @param {string} [publicId]
       * @param {string} [systemId]
       * @returns {DocumentType} which can either be used with `DOMImplementation.createDocument` upon document creation
       * 				  or can be put into the document via methods like `Node.insertBefore()` or `Node.replaceChild()`
       *
       * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMImplementation/createDocumentType MDN
       * @see https://www.w3.org/TR/DOM-Level-2-Core/core.html#Level-2-Core-DOM-createDocType DOM Level 2 Core
       * @see https://dom.spec.whatwg.org/#dom-domimplementation-createdocumenttype DOM Living Standard
       *
       * @see https://dom.spec.whatwg.org/#validate-and-extract DOM: Validate and extract
       * @see https://www.w3.org/TR/xml/#NT-NameStartChar XML Spec: Names
       * @see https://www.w3.org/TR/xml-names/#ns-qualnames XML Namespaces: Qualified names
       */
      createDocumentType: function(qualifiedName, publicId, systemId) {
        var node = new DocumentType();
        node.name = qualifiedName;
        node.nodeName = qualifiedName;
        node.publicId = publicId || "";
        node.systemId = systemId || "";
        return node;
      }
    };
    function Node() {
    }
    Node.prototype = {
      firstChild: null,
      lastChild: null,
      previousSibling: null,
      nextSibling: null,
      attributes: null,
      parentNode: null,
      childNodes: null,
      ownerDocument: null,
      nodeValue: null,
      namespaceURI: null,
      prefix: null,
      localName: null,
      // Modified in DOM Level 2:
      insertBefore: function(newChild, refChild) {
        return _insertBefore(this, newChild, refChild);
      },
      replaceChild: function(newChild, oldChild) {
        _insertBefore(this, newChild, oldChild, assertPreReplacementValidityInDocument);
        if (oldChild) {
          this.removeChild(oldChild);
        }
      },
      removeChild: function(oldChild) {
        return _removeChild(this, oldChild);
      },
      appendChild: function(newChild) {
        return this.insertBefore(newChild, null);
      },
      hasChildNodes: function() {
        return this.firstChild != null;
      },
      cloneNode: function(deep) {
        return cloneNode(this.ownerDocument || this, this, deep);
      },
      // Modified in DOM Level 2:
      normalize: function() {
        var child = this.firstChild;
        while (child) {
          var next = child.nextSibling;
          if (next && next.nodeType == TEXT_NODE && child.nodeType == TEXT_NODE) {
            this.removeChild(next);
            child.appendData(next.data);
          } else {
            child.normalize();
            child = next;
          }
        }
      },
      // Introduced in DOM Level 2:
      isSupported: function(feature, version2) {
        return this.ownerDocument.implementation.hasFeature(feature, version2);
      },
      // Introduced in DOM Level 2:
      hasAttributes: function() {
        return this.attributes.length > 0;
      },
      /**
       * Look up the prefix associated to the given namespace URI, starting from this node.
       * **The default namespace declarations are ignored by this method.**
       * See Namespace Prefix Lookup for details on the algorithm used by this method.
       *
       * _Note: The implementation seems to be incomplete when compared to the algorithm described in the specs._
       *
       * @param {string | null} namespaceURI
       * @returns {string | null}
       * @see https://www.w3.org/TR/DOM-Level-3-Core/core.html#Node3-lookupNamespacePrefix
       * @see https://www.w3.org/TR/DOM-Level-3-Core/namespaces-algorithms.html#lookupNamespacePrefixAlgo
       * @see https://dom.spec.whatwg.org/#dom-node-lookupprefix
       * @see https://github.com/xmldom/xmldom/issues/322
       */
      lookupPrefix: function(namespaceURI) {
        var el = this;
        while (el) {
          var map = el._nsMap;
          if (map) {
            for (var n in map) {
              if (Object.prototype.hasOwnProperty.call(map, n) && map[n] === namespaceURI) {
                return n;
              }
            }
          }
          el = el.nodeType == ATTRIBUTE_NODE ? el.ownerDocument : el.parentNode;
        }
        return null;
      },
      // Introduced in DOM Level 3:
      lookupNamespaceURI: function(prefix) {
        var el = this;
        while (el) {
          var map = el._nsMap;
          if (map) {
            if (prefix in map) {
              if (Object.prototype.hasOwnProperty.call(map, prefix)) {
                return map[prefix];
              }
            }
          }
          el = el.nodeType == ATTRIBUTE_NODE ? el.ownerDocument : el.parentNode;
        }
        return null;
      },
      // Introduced in DOM Level 3:
      isDefaultNamespace: function(namespaceURI) {
        var prefix = this.lookupPrefix(namespaceURI);
        return prefix == null;
      }
    };
    function _xmlEncoder(c) {
      return c == "<" && "&lt;" || c == ">" && "&gt;" || c == "&" && "&amp;" || c == '"' && "&quot;" || "&#" + c.charCodeAt() + ";";
    }
    copy(NodeType, Node);
    copy(NodeType, Node.prototype);
    function _visitNode(node, callback) {
      if (callback(node)) {
        return true;
      }
      if (node = node.firstChild) {
        do {
          if (_visitNode(node, callback)) {
            return true;
          }
        } while (node = node.nextSibling);
      }
    }
    function Document() {
      this.ownerDocument = this;
    }
    function _onAddAttribute(doc, el, newAttr) {
      doc && doc._inc++;
      var ns = newAttr.namespaceURI;
      if (ns === NAMESPACE.XMLNS) {
        el._nsMap[newAttr.prefix ? newAttr.localName : ""] = newAttr.value;
      }
    }
    function _onRemoveAttribute(doc, el, newAttr, remove) {
      doc && doc._inc++;
      var ns = newAttr.namespaceURI;
      if (ns === NAMESPACE.XMLNS) {
        delete el._nsMap[newAttr.prefix ? newAttr.localName : ""];
      }
    }
    function _onUpdateChild(doc, el, newChild) {
      if (doc && doc._inc) {
        doc._inc++;
        var cs = el.childNodes;
        if (newChild) {
          cs[cs.length++] = newChild;
        } else {
          var child = el.firstChild;
          var i = 0;
          while (child) {
            cs[i++] = child;
            child = child.nextSibling;
          }
          cs.length = i;
          delete cs[cs.length];
        }
      }
    }
    function _removeChild(parentNode, child) {
      var previous = child.previousSibling;
      var next = child.nextSibling;
      if (previous) {
        previous.nextSibling = next;
      } else {
        parentNode.firstChild = next;
      }
      if (next) {
        next.previousSibling = previous;
      } else {
        parentNode.lastChild = previous;
      }
      child.parentNode = null;
      child.previousSibling = null;
      child.nextSibling = null;
      _onUpdateChild(parentNode.ownerDocument, parentNode);
      return child;
    }
    function hasValidParentNodeType(node) {
      return node && (node.nodeType === Node.DOCUMENT_NODE || node.nodeType === Node.DOCUMENT_FRAGMENT_NODE || node.nodeType === Node.ELEMENT_NODE);
    }
    function hasInsertableNodeType(node) {
      return node && (isElementNode(node) || isTextNode(node) || isDocTypeNode(node) || node.nodeType === Node.DOCUMENT_FRAGMENT_NODE || node.nodeType === Node.COMMENT_NODE || node.nodeType === Node.PROCESSING_INSTRUCTION_NODE);
    }
    function isDocTypeNode(node) {
      return node && node.nodeType === Node.DOCUMENT_TYPE_NODE;
    }
    function isElementNode(node) {
      return node && node.nodeType === Node.ELEMENT_NODE;
    }
    function isTextNode(node) {
      return node && node.nodeType === Node.TEXT_NODE;
    }
    function isElementInsertionPossible(doc, child) {
      var parentChildNodes = doc.childNodes || [];
      if (find(parentChildNodes, isElementNode) || isDocTypeNode(child)) {
        return false;
      }
      var docTypeNode = find(parentChildNodes, isDocTypeNode);
      return !(child && docTypeNode && parentChildNodes.indexOf(docTypeNode) > parentChildNodes.indexOf(child));
    }
    function isElementReplacementPossible(doc, child) {
      var parentChildNodes = doc.childNodes || [];
      function hasElementChildThatIsNotChild(node) {
        return isElementNode(node) && node !== child;
      }
      if (find(parentChildNodes, hasElementChildThatIsNotChild)) {
        return false;
      }
      var docTypeNode = find(parentChildNodes, isDocTypeNode);
      return !(child && docTypeNode && parentChildNodes.indexOf(docTypeNode) > parentChildNodes.indexOf(child));
    }
    function assertPreInsertionValidity1to5(parent, node, child) {
      if (!hasValidParentNodeType(parent)) {
        throw new DOMException(HIERARCHY_REQUEST_ERR, "Unexpected parent node type " + parent.nodeType);
      }
      if (child && child.parentNode !== parent) {
        throw new DOMException(NOT_FOUND_ERR, "child not in parent");
      }
      if (
        // 4. If `node` is not a DocumentFragment, DocumentType, Element, or CharacterData node, then throw a "HierarchyRequestError" DOMException.
        !hasInsertableNodeType(node) || // 5. If either `node` is a Text node and `parent` is a document,
        // the sax parser currently adds top level text nodes, this will be fixed in 0.9.0
        // || (node.nodeType === Node.TEXT_NODE && parent.nodeType === Node.DOCUMENT_NODE)
        // or `node` is a doctype and `parent` is not a document, then throw a "HierarchyRequestError" DOMException.
        isDocTypeNode(node) && parent.nodeType !== Node.DOCUMENT_NODE
      ) {
        throw new DOMException(
          HIERARCHY_REQUEST_ERR,
          "Unexpected node type " + node.nodeType + " for parent node type " + parent.nodeType
        );
      }
    }
    function assertPreInsertionValidityInDocument(parent, node, child) {
      var parentChildNodes = parent.childNodes || [];
      var nodeChildNodes = node.childNodes || [];
      if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
        var nodeChildElements = nodeChildNodes.filter(isElementNode);
        if (nodeChildElements.length > 1 || find(nodeChildNodes, isTextNode)) {
          throw new DOMException(HIERARCHY_REQUEST_ERR, "More than one element or text in fragment");
        }
        if (nodeChildElements.length === 1 && !isElementInsertionPossible(parent, child)) {
          throw new DOMException(HIERARCHY_REQUEST_ERR, "Element in fragment can not be inserted before doctype");
        }
      }
      if (isElementNode(node)) {
        if (!isElementInsertionPossible(parent, child)) {
          throw new DOMException(HIERARCHY_REQUEST_ERR, "Only one element can be added and only after doctype");
        }
      }
      if (isDocTypeNode(node)) {
        if (find(parentChildNodes, isDocTypeNode)) {
          throw new DOMException(HIERARCHY_REQUEST_ERR, "Only one doctype is allowed");
        }
        var parentElementChild = find(parentChildNodes, isElementNode);
        if (child && parentChildNodes.indexOf(parentElementChild) < parentChildNodes.indexOf(child)) {
          throw new DOMException(HIERARCHY_REQUEST_ERR, "Doctype can only be inserted before an element");
        }
        if (!child && parentElementChild) {
          throw new DOMException(HIERARCHY_REQUEST_ERR, "Doctype can not be appended since element is present");
        }
      }
    }
    function assertPreReplacementValidityInDocument(parent, node, child) {
      var parentChildNodes = parent.childNodes || [];
      var nodeChildNodes = node.childNodes || [];
      if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
        var nodeChildElements = nodeChildNodes.filter(isElementNode);
        if (nodeChildElements.length > 1 || find(nodeChildNodes, isTextNode)) {
          throw new DOMException(HIERARCHY_REQUEST_ERR, "More than one element or text in fragment");
        }
        if (nodeChildElements.length === 1 && !isElementReplacementPossible(parent, child)) {
          throw new DOMException(HIERARCHY_REQUEST_ERR, "Element in fragment can not be inserted before doctype");
        }
      }
      if (isElementNode(node)) {
        if (!isElementReplacementPossible(parent, child)) {
          throw new DOMException(HIERARCHY_REQUEST_ERR, "Only one element can be added and only after doctype");
        }
      }
      if (isDocTypeNode(node)) {
        let hasDoctypeChildThatIsNotChild2 = function(node2) {
          return isDocTypeNode(node2) && node2 !== child;
        };
        var hasDoctypeChildThatIsNotChild = hasDoctypeChildThatIsNotChild2;
        if (find(parentChildNodes, hasDoctypeChildThatIsNotChild2)) {
          throw new DOMException(HIERARCHY_REQUEST_ERR, "Only one doctype is allowed");
        }
        var parentElementChild = find(parentChildNodes, isElementNode);
        if (child && parentChildNodes.indexOf(parentElementChild) < parentChildNodes.indexOf(child)) {
          throw new DOMException(HIERARCHY_REQUEST_ERR, "Doctype can only be inserted before an element");
        }
      }
    }
    function _insertBefore(parent, node, child, _inDocumentAssertion) {
      assertPreInsertionValidity1to5(parent, node, child);
      if (parent.nodeType === Node.DOCUMENT_NODE) {
        (_inDocumentAssertion || assertPreInsertionValidityInDocument)(parent, node, child);
      }
      var cp = node.parentNode;
      if (cp) {
        cp.removeChild(node);
      }
      if (node.nodeType === DOCUMENT_FRAGMENT_NODE) {
        var newFirst = node.firstChild;
        if (newFirst == null) {
          return node;
        }
        var newLast = node.lastChild;
      } else {
        newFirst = newLast = node;
      }
      var pre = child ? child.previousSibling : parent.lastChild;
      newFirst.previousSibling = pre;
      newLast.nextSibling = child;
      if (pre) {
        pre.nextSibling = newFirst;
      } else {
        parent.firstChild = newFirst;
      }
      if (child == null) {
        parent.lastChild = newLast;
      } else {
        child.previousSibling = newLast;
      }
      do {
        newFirst.parentNode = parent;
      } while (newFirst !== newLast && (newFirst = newFirst.nextSibling));
      _onUpdateChild(parent.ownerDocument || parent, parent);
      if (node.nodeType == DOCUMENT_FRAGMENT_NODE) {
        node.firstChild = node.lastChild = null;
      }
      return node;
    }
    function _appendSingleChild(parentNode, newChild) {
      if (newChild.parentNode) {
        newChild.parentNode.removeChild(newChild);
      }
      newChild.parentNode = parentNode;
      newChild.previousSibling = parentNode.lastChild;
      newChild.nextSibling = null;
      if (newChild.previousSibling) {
        newChild.previousSibling.nextSibling = newChild;
      } else {
        parentNode.firstChild = newChild;
      }
      parentNode.lastChild = newChild;
      _onUpdateChild(parentNode.ownerDocument, parentNode, newChild);
      return newChild;
    }
    Document.prototype = {
      //implementation : null,
      nodeName: "#document",
      nodeType: DOCUMENT_NODE,
      /**
       * The DocumentType node of the document.
       *
       * @readonly
       * @type DocumentType
       */
      doctype: null,
      documentElement: null,
      _inc: 1,
      insertBefore: function(newChild, refChild) {
        if (newChild.nodeType == DOCUMENT_FRAGMENT_NODE) {
          var child = newChild.firstChild;
          while (child) {
            var next = child.nextSibling;
            this.insertBefore(child, refChild);
            child = next;
          }
          return newChild;
        }
        _insertBefore(this, newChild, refChild);
        newChild.ownerDocument = this;
        if (this.documentElement === null && newChild.nodeType === ELEMENT_NODE) {
          this.documentElement = newChild;
        }
        return newChild;
      },
      removeChild: function(oldChild) {
        if (this.documentElement == oldChild) {
          this.documentElement = null;
        }
        return _removeChild(this, oldChild);
      },
      replaceChild: function(newChild, oldChild) {
        _insertBefore(this, newChild, oldChild, assertPreReplacementValidityInDocument);
        newChild.ownerDocument = this;
        if (oldChild) {
          this.removeChild(oldChild);
        }
        if (isElementNode(newChild)) {
          this.documentElement = newChild;
        }
      },
      // Introduced in DOM Level 2:
      importNode: function(importedNode, deep) {
        return importNode(this, importedNode, deep);
      },
      // Introduced in DOM Level 2:
      getElementById: function(id) {
        var rtv = null;
        _visitNode(this.documentElement, function(node) {
          if (node.nodeType == ELEMENT_NODE) {
            if (node.getAttribute("id") == id) {
              rtv = node;
              return true;
            }
          }
        });
        return rtv;
      },
      /**
       * The `getElementsByClassName` method of `Document` interface returns an array-like object
       * of all child elements which have **all** of the given class name(s).
       *
       * Returns an empty list if `classeNames` is an empty string or only contains HTML white space characters.
       *
       *
       * Warning: This is a live LiveNodeList.
       * Changes in the DOM will reflect in the array as the changes occur.
       * If an element selected by this array no longer qualifies for the selector,
       * it will automatically be removed. Be aware of this for iteration purposes.
       *
       * @param {string} classNames is a string representing the class name(s) to match; multiple class names are separated by (ASCII-)whitespace
       *
       * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementsByClassName
       * @see https://dom.spec.whatwg.org/#concept-getelementsbyclassname
       */
      getElementsByClassName: function(classNames) {
        var classNamesSet = toOrderedSet(classNames);
        return new LiveNodeList(this, function(base) {
          var ls = [];
          if (classNamesSet.length > 0) {
            _visitNode(base.documentElement, function(node) {
              if (node !== base && node.nodeType === ELEMENT_NODE) {
                var nodeClassNames = node.getAttribute("class");
                if (nodeClassNames) {
                  var matches = classNames === nodeClassNames;
                  if (!matches) {
                    var nodeClassNamesSet = toOrderedSet(nodeClassNames);
                    matches = classNamesSet.every(arrayIncludes(nodeClassNamesSet));
                  }
                  if (matches) {
                    ls.push(node);
                  }
                }
              }
            });
          }
          return ls;
        });
      },
      //document factory method:
      createElement: function(tagName) {
        var node = new Element();
        node.ownerDocument = this;
        node.nodeName = tagName;
        node.tagName = tagName;
        node.localName = tagName;
        node.childNodes = new NodeList();
        var attrs = node.attributes = new NamedNodeMap();
        attrs._ownerElement = node;
        return node;
      },
      createDocumentFragment: function() {
        var node = new DocumentFragment();
        node.ownerDocument = this;
        node.childNodes = new NodeList();
        return node;
      },
      createTextNode: function(data2) {
        var node = new Text();
        node.ownerDocument = this;
        node.appendData(data2);
        return node;
      },
      createComment: function(data2) {
        var node = new Comment();
        node.ownerDocument = this;
        node.appendData(data2);
        return node;
      },
      createCDATASection: function(data2) {
        var node = new CDATASection();
        node.ownerDocument = this;
        node.appendData(data2);
        return node;
      },
      createProcessingInstruction: function(target, data2) {
        var node = new ProcessingInstruction();
        node.ownerDocument = this;
        node.tagName = node.nodeName = node.target = target;
        node.nodeValue = node.data = data2;
        return node;
      },
      createAttribute: function(name2) {
        var node = new Attr();
        node.ownerDocument = this;
        node.name = name2;
        node.nodeName = name2;
        node.localName = name2;
        node.specified = true;
        return node;
      },
      createEntityReference: function(name2) {
        var node = new EntityReference();
        node.ownerDocument = this;
        node.nodeName = name2;
        return node;
      },
      // Introduced in DOM Level 2:
      createElementNS: function(namespaceURI, qualifiedName) {
        var node = new Element();
        var pl = qualifiedName.split(":");
        var attrs = node.attributes = new NamedNodeMap();
        node.childNodes = new NodeList();
        node.ownerDocument = this;
        node.nodeName = qualifiedName;
        node.tagName = qualifiedName;
        node.namespaceURI = namespaceURI;
        if (pl.length == 2) {
          node.prefix = pl[0];
          node.localName = pl[1];
        } else {
          node.localName = qualifiedName;
        }
        attrs._ownerElement = node;
        return node;
      },
      // Introduced in DOM Level 2:
      createAttributeNS: function(namespaceURI, qualifiedName) {
        var node = new Attr();
        var pl = qualifiedName.split(":");
        node.ownerDocument = this;
        node.nodeName = qualifiedName;
        node.name = qualifiedName;
        node.namespaceURI = namespaceURI;
        node.specified = true;
        if (pl.length == 2) {
          node.prefix = pl[0];
          node.localName = pl[1];
        } else {
          node.localName = qualifiedName;
        }
        return node;
      }
    };
    _extends(Document, Node);
    function Element() {
      this._nsMap = {};
    }
    Element.prototype = {
      nodeType: ELEMENT_NODE,
      hasAttribute: function(name2) {
        return this.getAttributeNode(name2) != null;
      },
      getAttribute: function(name2) {
        var attr = this.getAttributeNode(name2);
        return attr && attr.value || "";
      },
      getAttributeNode: function(name2) {
        return this.attributes.getNamedItem(name2);
      },
      setAttribute: function(name2, value) {
        var attr = this.ownerDocument.createAttribute(name2);
        attr.value = attr.nodeValue = "" + value;
        this.setAttributeNode(attr);
      },
      removeAttribute: function(name2) {
        var attr = this.getAttributeNode(name2);
        attr && this.removeAttributeNode(attr);
      },
      //four real opeartion method
      appendChild: function(newChild) {
        if (newChild.nodeType === DOCUMENT_FRAGMENT_NODE) {
          return this.insertBefore(newChild, null);
        } else {
          return _appendSingleChild(this, newChild);
        }
      },
      setAttributeNode: function(newAttr) {
        return this.attributes.setNamedItem(newAttr);
      },
      setAttributeNodeNS: function(newAttr) {
        return this.attributes.setNamedItemNS(newAttr);
      },
      removeAttributeNode: function(oldAttr) {
        return this.attributes.removeNamedItem(oldAttr.nodeName);
      },
      //get real attribute name,and remove it by removeAttributeNode
      removeAttributeNS: function(namespaceURI, localName) {
        var old = this.getAttributeNodeNS(namespaceURI, localName);
        old && this.removeAttributeNode(old);
      },
      hasAttributeNS: function(namespaceURI, localName) {
        return this.getAttributeNodeNS(namespaceURI, localName) != null;
      },
      getAttributeNS: function(namespaceURI, localName) {
        var attr = this.getAttributeNodeNS(namespaceURI, localName);
        return attr && attr.value || "";
      },
      setAttributeNS: function(namespaceURI, qualifiedName, value) {
        var attr = this.ownerDocument.createAttributeNS(namespaceURI, qualifiedName);
        attr.value = attr.nodeValue = "" + value;
        this.setAttributeNode(attr);
      },
      getAttributeNodeNS: function(namespaceURI, localName) {
        return this.attributes.getNamedItemNS(namespaceURI, localName);
      },
      getElementsByTagName: function(tagName) {
        return new LiveNodeList(this, function(base) {
          var ls = [];
          _visitNode(base, function(node) {
            if (node !== base && node.nodeType == ELEMENT_NODE && (tagName === "*" || node.tagName == tagName)) {
              ls.push(node);
            }
          });
          return ls;
        });
      },
      getElementsByTagNameNS: function(namespaceURI, localName) {
        return new LiveNodeList(this, function(base) {
          var ls = [];
          _visitNode(base, function(node) {
            if (node !== base && node.nodeType === ELEMENT_NODE && (namespaceURI === "*" || node.namespaceURI === namespaceURI) && (localName === "*" || node.localName == localName)) {
              ls.push(node);
            }
          });
          return ls;
        });
      }
    };
    Document.prototype.getElementsByTagName = Element.prototype.getElementsByTagName;
    Document.prototype.getElementsByTagNameNS = Element.prototype.getElementsByTagNameNS;
    _extends(Element, Node);
    function Attr() {
    }
    Attr.prototype.nodeType = ATTRIBUTE_NODE;
    _extends(Attr, Node);
    function CharacterData() {
    }
    CharacterData.prototype = {
      data: "",
      substringData: function(offset, count) {
        return this.data.substring(offset, offset + count);
      },
      appendData: function(text) {
        text = this.data + text;
        this.nodeValue = this.data = text;
        this.length = text.length;
      },
      insertData: function(offset, text) {
        this.replaceData(offset, 0, text);
      },
      appendChild: function(newChild) {
        throw new Error(ExceptionMessage[HIERARCHY_REQUEST_ERR]);
      },
      deleteData: function(offset, count) {
        this.replaceData(offset, count, "");
      },
      replaceData: function(offset, count, text) {
        var start = this.data.substring(0, offset);
        var end = this.data.substring(offset + count);
        text = start + text + end;
        this.nodeValue = this.data = text;
        this.length = text.length;
      }
    };
    _extends(CharacterData, Node);
    function Text() {
    }
    Text.prototype = {
      nodeName: "#text",
      nodeType: TEXT_NODE,
      splitText: function(offset) {
        var text = this.data;
        var newText = text.substring(offset);
        text = text.substring(0, offset);
        this.data = this.nodeValue = text;
        this.length = text.length;
        var newNode = this.ownerDocument.createTextNode(newText);
        if (this.parentNode) {
          this.parentNode.insertBefore(newNode, this.nextSibling);
        }
        return newNode;
      }
    };
    _extends(Text, CharacterData);
    function Comment() {
    }
    Comment.prototype = {
      nodeName: "#comment",
      nodeType: COMMENT_NODE
    };
    _extends(Comment, CharacterData);
    function CDATASection() {
    }
    CDATASection.prototype = {
      nodeName: "#cdata-section",
      nodeType: CDATA_SECTION_NODE
    };
    _extends(CDATASection, CharacterData);
    function DocumentType() {
    }
    DocumentType.prototype.nodeType = DOCUMENT_TYPE_NODE;
    _extends(DocumentType, Node);
    function Notation() {
    }
    Notation.prototype.nodeType = NOTATION_NODE;
    _extends(Notation, Node);
    function Entity() {
    }
    Entity.prototype.nodeType = ENTITY_NODE;
    _extends(Entity, Node);
    function EntityReference() {
    }
    EntityReference.prototype.nodeType = ENTITY_REFERENCE_NODE;
    _extends(EntityReference, Node);
    function DocumentFragment() {
    }
    DocumentFragment.prototype.nodeName = "#document-fragment";
    DocumentFragment.prototype.nodeType = DOCUMENT_FRAGMENT_NODE;
    _extends(DocumentFragment, Node);
    function ProcessingInstruction() {
    }
    ProcessingInstruction.prototype.nodeType = PROCESSING_INSTRUCTION_NODE;
    _extends(ProcessingInstruction, Node);
    function XMLSerializer() {
    }
    XMLSerializer.prototype.serializeToString = function(node, isHtml, nodeFilter) {
      return nodeSerializeToString.call(node, isHtml, nodeFilter);
    };
    Node.prototype.toString = nodeSerializeToString;
    function nodeSerializeToString(isHtml, nodeFilter) {
      var buf = [];
      var refNode = this.nodeType == 9 && this.documentElement || this;
      var prefix = refNode.prefix;
      var uri = refNode.namespaceURI;
      if (uri && prefix == null) {
        var prefix = refNode.lookupPrefix(uri);
        if (prefix == null) {
          var visibleNamespaces = [
            { namespace: uri, prefix: null }
            //{namespace:uri,prefix:''}
          ];
        }
      }
      serializeToString(this, buf, isHtml, nodeFilter, visibleNamespaces);
      return buf.join("");
    }
    function needNamespaceDefine(node, isHTML, visibleNamespaces) {
      var prefix = node.prefix || "";
      var uri = node.namespaceURI;
      if (!uri) {
        return false;
      }
      if (prefix === "xml" && uri === NAMESPACE.XML || uri === NAMESPACE.XMLNS) {
        return false;
      }
      var i = visibleNamespaces.length;
      while (i--) {
        var ns = visibleNamespaces[i];
        if (ns.prefix === prefix) {
          return ns.namespace !== uri;
        }
      }
      return true;
    }
    function addSerializedAttribute(buf, qualifiedName, value) {
      buf.push(" ", qualifiedName, '="', value.replace(/[<&"]/g, _xmlEncoder), '"');
    }
    function serializeToString(node, buf, isHTML, nodeFilter, visibleNamespaces) {
      if (!visibleNamespaces) {
        visibleNamespaces = [];
      }
      if (nodeFilter) {
        node = nodeFilter(node);
        if (node) {
          if (typeof node == "string") {
            buf.push(node);
            return;
          }
        } else {
          return;
        }
      }
      switch (node.nodeType) {
        case ELEMENT_NODE:
          var attrs = node.attributes;
          var len = attrs.length;
          var child = node.firstChild;
          var nodeName = node.tagName;
          isHTML = NAMESPACE.isHTML(node.namespaceURI) || isHTML;
          var prefixedNodeName = nodeName;
          if (!isHTML && !node.prefix && node.namespaceURI) {
            var defaultNS;
            for (var ai = 0; ai < attrs.length; ai++) {
              if (attrs.item(ai).name === "xmlns") {
                defaultNS = attrs.item(ai).value;
                break;
              }
            }
            if (!defaultNS) {
              for (var nsi = visibleNamespaces.length - 1; nsi >= 0; nsi--) {
                var namespace = visibleNamespaces[nsi];
                if (namespace.prefix === "" && namespace.namespace === node.namespaceURI) {
                  defaultNS = namespace.namespace;
                  break;
                }
              }
            }
            if (defaultNS !== node.namespaceURI) {
              for (var nsi = visibleNamespaces.length - 1; nsi >= 0; nsi--) {
                var namespace = visibleNamespaces[nsi];
                if (namespace.namespace === node.namespaceURI) {
                  if (namespace.prefix) {
                    prefixedNodeName = namespace.prefix + ":" + nodeName;
                  }
                  break;
                }
              }
            }
          }
          buf.push("<", prefixedNodeName);
          for (var i = 0; i < len; i++) {
            var attr = attrs.item(i);
            if (attr.prefix == "xmlns") {
              visibleNamespaces.push({ prefix: attr.localName, namespace: attr.value });
            } else if (attr.nodeName == "xmlns") {
              visibleNamespaces.push({ prefix: "", namespace: attr.value });
            }
          }
          for (var i = 0; i < len; i++) {
            var attr = attrs.item(i);
            if (needNamespaceDefine(attr, isHTML, visibleNamespaces)) {
              var prefix = attr.prefix || "";
              var uri = attr.namespaceURI;
              addSerializedAttribute(buf, prefix ? "xmlns:" + prefix : "xmlns", uri);
              visibleNamespaces.push({ prefix, namespace: uri });
            }
            serializeToString(attr, buf, isHTML, nodeFilter, visibleNamespaces);
          }
          if (nodeName === prefixedNodeName && needNamespaceDefine(node, isHTML, visibleNamespaces)) {
            var prefix = node.prefix || "";
            var uri = node.namespaceURI;
            addSerializedAttribute(buf, prefix ? "xmlns:" + prefix : "xmlns", uri);
            visibleNamespaces.push({ prefix, namespace: uri });
          }
          if (child || isHTML && !/^(?:meta|link|img|br|hr|input)$/i.test(nodeName)) {
            buf.push(">");
            if (isHTML && /^script$/i.test(nodeName)) {
              while (child) {
                if (child.data) {
                  buf.push(child.data);
                } else {
                  serializeToString(child, buf, isHTML, nodeFilter, visibleNamespaces.slice());
                }
                child = child.nextSibling;
              }
            } else {
              while (child) {
                serializeToString(child, buf, isHTML, nodeFilter, visibleNamespaces.slice());
                child = child.nextSibling;
              }
            }
            buf.push("</", prefixedNodeName, ">");
          } else {
            buf.push("/>");
          }
          return;
        case DOCUMENT_NODE:
        case DOCUMENT_FRAGMENT_NODE:
          var child = node.firstChild;
          while (child) {
            serializeToString(child, buf, isHTML, nodeFilter, visibleNamespaces.slice());
            child = child.nextSibling;
          }
          return;
        case ATTRIBUTE_NODE:
          return addSerializedAttribute(buf, node.name, node.value);
        case TEXT_NODE:
          return buf.push(
            node.data.replace(/[<&]/g, _xmlEncoder).replace(/]]>/g, "]]&gt;")
          );
        case CDATA_SECTION_NODE:
          return buf.push("<![CDATA[", node.data, "]]>");
        case COMMENT_NODE:
          return buf.push("<!--", node.data, "-->");
        case DOCUMENT_TYPE_NODE:
          var pubid = node.publicId;
          var sysid = node.systemId;
          buf.push("<!DOCTYPE ", node.name);
          if (pubid) {
            buf.push(" PUBLIC ", pubid);
            if (sysid && sysid != ".") {
              buf.push(" ", sysid);
            }
            buf.push(">");
          } else if (sysid && sysid != ".") {
            buf.push(" SYSTEM ", sysid, ">");
          } else {
            var sub = node.internalSubset;
            if (sub) {
              buf.push(" [", sub, "]");
            }
            buf.push(">");
          }
          return;
        case PROCESSING_INSTRUCTION_NODE:
          return buf.push("<?", node.target, " ", node.data, "?>");
        case ENTITY_REFERENCE_NODE:
          return buf.push("&", node.nodeName, ";");
        //case ENTITY_NODE:
        //case NOTATION_NODE:
        default:
          buf.push("??", node.nodeName);
      }
    }
    function importNode(doc, node, deep) {
      var node2;
      switch (node.nodeType) {
        case ELEMENT_NODE:
          node2 = node.cloneNode(false);
          node2.ownerDocument = doc;
        //var attrs = node2.attributes;
        //var len = attrs.length;
        //for(var i=0;i<len;i++){
        //node2.setAttributeNodeNS(importNode(doc,attrs.item(i),deep));
        //}
        case DOCUMENT_FRAGMENT_NODE:
          break;
        case ATTRIBUTE_NODE:
          deep = true;
          break;
      }
      if (!node2) {
        node2 = node.cloneNode(false);
      }
      node2.ownerDocument = doc;
      node2.parentNode = null;
      if (deep) {
        var child = node.firstChild;
        while (child) {
          node2.appendChild(importNode(doc, child, deep));
          child = child.nextSibling;
        }
      }
      return node2;
    }
    function cloneNode(doc, node, deep) {
      var node2 = new node.constructor();
      for (var n in node) {
        if (Object.prototype.hasOwnProperty.call(node, n)) {
          var v = node[n];
          if (typeof v != "object") {
            if (v != node2[n]) {
              node2[n] = v;
            }
          }
        }
      }
      if (node.childNodes) {
        node2.childNodes = new NodeList();
      }
      node2.ownerDocument = doc;
      switch (node2.nodeType) {
        case ELEMENT_NODE:
          var attrs = node.attributes;
          var attrs2 = node2.attributes = new NamedNodeMap();
          var len = attrs.length;
          attrs2._ownerElement = node2;
          for (var i = 0; i < len; i++) {
            node2.setAttributeNode(cloneNode(doc, attrs.item(i), true));
          }
          break;
          ;
        case ATTRIBUTE_NODE:
          deep = true;
      }
      if (deep) {
        var child = node.firstChild;
        while (child) {
          node2.appendChild(cloneNode(doc, child, deep));
          child = child.nextSibling;
        }
      }
      return node2;
    }
    function __set__(object, key, value) {
      object[key] = value;
    }
    try {
      if (Object.defineProperty) {
        let getTextContent2 = function(node) {
          switch (node.nodeType) {
            case ELEMENT_NODE:
            case DOCUMENT_FRAGMENT_NODE:
              var buf = [];
              node = node.firstChild;
              while (node) {
                if (node.nodeType !== 7 && node.nodeType !== 8) {
                  buf.push(getTextContent2(node));
                }
                node = node.nextSibling;
              }
              return buf.join("");
            default:
              return node.nodeValue;
          }
        };
        getTextContent = getTextContent2;
        Object.defineProperty(LiveNodeList.prototype, "length", {
          get: function() {
            _updateLiveList(this);
            return this.$$length;
          }
        });
        Object.defineProperty(Node.prototype, "textContent", {
          get: function() {
            return getTextContent2(this);
          },
          set: function(data2) {
            switch (this.nodeType) {
              case ELEMENT_NODE:
              case DOCUMENT_FRAGMENT_NODE:
                while (this.firstChild) {
                  this.removeChild(this.firstChild);
                }
                if (data2 || String(data2)) {
                  this.appendChild(this.ownerDocument.createTextNode(data2));
                }
                break;
              default:
                this.data = data2;
                this.value = data2;
                this.nodeValue = data2;
            }
          }
        });
        __set__ = function(object, key, value) {
          object["$$" + key] = value;
        };
      }
    } catch (e) {
    }
    var getTextContent;
    exports.DocumentType = DocumentType;
    exports.DOMException = DOMException;
    exports.DOMImplementation = DOMImplementation;
    exports.Element = Element;
    exports.Node = Node;
    exports.NodeList = NodeList;
    exports.XMLSerializer = XMLSerializer;
  }
});

// ../../node_modules/@xmldom/xmldom/lib/entities.js
var require_entities = __commonJS({
  "../../node_modules/@xmldom/xmldom/lib/entities.js"(exports) {
    "use strict";
    var freeze = require_conventions().freeze;
    exports.XML_ENTITIES = freeze({
      amp: "&",
      apos: "'",
      gt: ">",
      lt: "<",
      quot: '"'
    });
    exports.HTML_ENTITIES = freeze({
      Aacute: "\xC1",
      aacute: "\xE1",
      Abreve: "\u0102",
      abreve: "\u0103",
      ac: "\u223E",
      acd: "\u223F",
      acE: "\u223E\u0333",
      Acirc: "\xC2",
      acirc: "\xE2",
      acute: "\xB4",
      Acy: "\u0410",
      acy: "\u0430",
      AElig: "\xC6",
      aelig: "\xE6",
      af: "\u2061",
      Afr: "\u{1D504}",
      afr: "\u{1D51E}",
      Agrave: "\xC0",
      agrave: "\xE0",
      alefsym: "\u2135",
      aleph: "\u2135",
      Alpha: "\u0391",
      alpha: "\u03B1",
      Amacr: "\u0100",
      amacr: "\u0101",
      amalg: "\u2A3F",
      AMP: "&",
      amp: "&",
      And: "\u2A53",
      and: "\u2227",
      andand: "\u2A55",
      andd: "\u2A5C",
      andslope: "\u2A58",
      andv: "\u2A5A",
      ang: "\u2220",
      ange: "\u29A4",
      angle: "\u2220",
      angmsd: "\u2221",
      angmsdaa: "\u29A8",
      angmsdab: "\u29A9",
      angmsdac: "\u29AA",
      angmsdad: "\u29AB",
      angmsdae: "\u29AC",
      angmsdaf: "\u29AD",
      angmsdag: "\u29AE",
      angmsdah: "\u29AF",
      angrt: "\u221F",
      angrtvb: "\u22BE",
      angrtvbd: "\u299D",
      angsph: "\u2222",
      angst: "\xC5",
      angzarr: "\u237C",
      Aogon: "\u0104",
      aogon: "\u0105",
      Aopf: "\u{1D538}",
      aopf: "\u{1D552}",
      ap: "\u2248",
      apacir: "\u2A6F",
      apE: "\u2A70",
      ape: "\u224A",
      apid: "\u224B",
      apos: "'",
      ApplyFunction: "\u2061",
      approx: "\u2248",
      approxeq: "\u224A",
      Aring: "\xC5",
      aring: "\xE5",
      Ascr: "\u{1D49C}",
      ascr: "\u{1D4B6}",
      Assign: "\u2254",
      ast: "*",
      asymp: "\u2248",
      asympeq: "\u224D",
      Atilde: "\xC3",
      atilde: "\xE3",
      Auml: "\xC4",
      auml: "\xE4",
      awconint: "\u2233",
      awint: "\u2A11",
      backcong: "\u224C",
      backepsilon: "\u03F6",
      backprime: "\u2035",
      backsim: "\u223D",
      backsimeq: "\u22CD",
      Backslash: "\u2216",
      Barv: "\u2AE7",
      barvee: "\u22BD",
      Barwed: "\u2306",
      barwed: "\u2305",
      barwedge: "\u2305",
      bbrk: "\u23B5",
      bbrktbrk: "\u23B6",
      bcong: "\u224C",
      Bcy: "\u0411",
      bcy: "\u0431",
      bdquo: "\u201E",
      becaus: "\u2235",
      Because: "\u2235",
      because: "\u2235",
      bemptyv: "\u29B0",
      bepsi: "\u03F6",
      bernou: "\u212C",
      Bernoullis: "\u212C",
      Beta: "\u0392",
      beta: "\u03B2",
      beth: "\u2136",
      between: "\u226C",
      Bfr: "\u{1D505}",
      bfr: "\u{1D51F}",
      bigcap: "\u22C2",
      bigcirc: "\u25EF",
      bigcup: "\u22C3",
      bigodot: "\u2A00",
      bigoplus: "\u2A01",
      bigotimes: "\u2A02",
      bigsqcup: "\u2A06",
      bigstar: "\u2605",
      bigtriangledown: "\u25BD",
      bigtriangleup: "\u25B3",
      biguplus: "\u2A04",
      bigvee: "\u22C1",
      bigwedge: "\u22C0",
      bkarow: "\u290D",
      blacklozenge: "\u29EB",
      blacksquare: "\u25AA",
      blacktriangle: "\u25B4",
      blacktriangledown: "\u25BE",
      blacktriangleleft: "\u25C2",
      blacktriangleright: "\u25B8",
      blank: "\u2423",
      blk12: "\u2592",
      blk14: "\u2591",
      blk34: "\u2593",
      block: "\u2588",
      bne: "=\u20E5",
      bnequiv: "\u2261\u20E5",
      bNot: "\u2AED",
      bnot: "\u2310",
      Bopf: "\u{1D539}",
      bopf: "\u{1D553}",
      bot: "\u22A5",
      bottom: "\u22A5",
      bowtie: "\u22C8",
      boxbox: "\u29C9",
      boxDL: "\u2557",
      boxDl: "\u2556",
      boxdL: "\u2555",
      boxdl: "\u2510",
      boxDR: "\u2554",
      boxDr: "\u2553",
      boxdR: "\u2552",
      boxdr: "\u250C",
      boxH: "\u2550",
      boxh: "\u2500",
      boxHD: "\u2566",
      boxHd: "\u2564",
      boxhD: "\u2565",
      boxhd: "\u252C",
      boxHU: "\u2569",
      boxHu: "\u2567",
      boxhU: "\u2568",
      boxhu: "\u2534",
      boxminus: "\u229F",
      boxplus: "\u229E",
      boxtimes: "\u22A0",
      boxUL: "\u255D",
      boxUl: "\u255C",
      boxuL: "\u255B",
      boxul: "\u2518",
      boxUR: "\u255A",
      boxUr: "\u2559",
      boxuR: "\u2558",
      boxur: "\u2514",
      boxV: "\u2551",
      boxv: "\u2502",
      boxVH: "\u256C",
      boxVh: "\u256B",
      boxvH: "\u256A",
      boxvh: "\u253C",
      boxVL: "\u2563",
      boxVl: "\u2562",
      boxvL: "\u2561",
      boxvl: "\u2524",
      boxVR: "\u2560",
      boxVr: "\u255F",
      boxvR: "\u255E",
      boxvr: "\u251C",
      bprime: "\u2035",
      Breve: "\u02D8",
      breve: "\u02D8",
      brvbar: "\xA6",
      Bscr: "\u212C",
      bscr: "\u{1D4B7}",
      bsemi: "\u204F",
      bsim: "\u223D",
      bsime: "\u22CD",
      bsol: "\\",
      bsolb: "\u29C5",
      bsolhsub: "\u27C8",
      bull: "\u2022",
      bullet: "\u2022",
      bump: "\u224E",
      bumpE: "\u2AAE",
      bumpe: "\u224F",
      Bumpeq: "\u224E",
      bumpeq: "\u224F",
      Cacute: "\u0106",
      cacute: "\u0107",
      Cap: "\u22D2",
      cap: "\u2229",
      capand: "\u2A44",
      capbrcup: "\u2A49",
      capcap: "\u2A4B",
      capcup: "\u2A47",
      capdot: "\u2A40",
      CapitalDifferentialD: "\u2145",
      caps: "\u2229\uFE00",
      caret: "\u2041",
      caron: "\u02C7",
      Cayleys: "\u212D",
      ccaps: "\u2A4D",
      Ccaron: "\u010C",
      ccaron: "\u010D",
      Ccedil: "\xC7",
      ccedil: "\xE7",
      Ccirc: "\u0108",
      ccirc: "\u0109",
      Cconint: "\u2230",
      ccups: "\u2A4C",
      ccupssm: "\u2A50",
      Cdot: "\u010A",
      cdot: "\u010B",
      cedil: "\xB8",
      Cedilla: "\xB8",
      cemptyv: "\u29B2",
      cent: "\xA2",
      CenterDot: "\xB7",
      centerdot: "\xB7",
      Cfr: "\u212D",
      cfr: "\u{1D520}",
      CHcy: "\u0427",
      chcy: "\u0447",
      check: "\u2713",
      checkmark: "\u2713",
      Chi: "\u03A7",
      chi: "\u03C7",
      cir: "\u25CB",
      circ: "\u02C6",
      circeq: "\u2257",
      circlearrowleft: "\u21BA",
      circlearrowright: "\u21BB",
      circledast: "\u229B",
      circledcirc: "\u229A",
      circleddash: "\u229D",
      CircleDot: "\u2299",
      circledR: "\xAE",
      circledS: "\u24C8",
      CircleMinus: "\u2296",
      CirclePlus: "\u2295",
      CircleTimes: "\u2297",
      cirE: "\u29C3",
      cire: "\u2257",
      cirfnint: "\u2A10",
      cirmid: "\u2AEF",
      cirscir: "\u29C2",
      ClockwiseContourIntegral: "\u2232",
      CloseCurlyDoubleQuote: "\u201D",
      CloseCurlyQuote: "\u2019",
      clubs: "\u2663",
      clubsuit: "\u2663",
      Colon: "\u2237",
      colon: ":",
      Colone: "\u2A74",
      colone: "\u2254",
      coloneq: "\u2254",
      comma: ",",
      commat: "@",
      comp: "\u2201",
      compfn: "\u2218",
      complement: "\u2201",
      complexes: "\u2102",
      cong: "\u2245",
      congdot: "\u2A6D",
      Congruent: "\u2261",
      Conint: "\u222F",
      conint: "\u222E",
      ContourIntegral: "\u222E",
      Copf: "\u2102",
      copf: "\u{1D554}",
      coprod: "\u2210",
      Coproduct: "\u2210",
      COPY: "\xA9",
      copy: "\xA9",
      copysr: "\u2117",
      CounterClockwiseContourIntegral: "\u2233",
      crarr: "\u21B5",
      Cross: "\u2A2F",
      cross: "\u2717",
      Cscr: "\u{1D49E}",
      cscr: "\u{1D4B8}",
      csub: "\u2ACF",
      csube: "\u2AD1",
      csup: "\u2AD0",
      csupe: "\u2AD2",
      ctdot: "\u22EF",
      cudarrl: "\u2938",
      cudarrr: "\u2935",
      cuepr: "\u22DE",
      cuesc: "\u22DF",
      cularr: "\u21B6",
      cularrp: "\u293D",
      Cup: "\u22D3",
      cup: "\u222A",
      cupbrcap: "\u2A48",
      CupCap: "\u224D",
      cupcap: "\u2A46",
      cupcup: "\u2A4A",
      cupdot: "\u228D",
      cupor: "\u2A45",
      cups: "\u222A\uFE00",
      curarr: "\u21B7",
      curarrm: "\u293C",
      curlyeqprec: "\u22DE",
      curlyeqsucc: "\u22DF",
      curlyvee: "\u22CE",
      curlywedge: "\u22CF",
      curren: "\xA4",
      curvearrowleft: "\u21B6",
      curvearrowright: "\u21B7",
      cuvee: "\u22CE",
      cuwed: "\u22CF",
      cwconint: "\u2232",
      cwint: "\u2231",
      cylcty: "\u232D",
      Dagger: "\u2021",
      dagger: "\u2020",
      daleth: "\u2138",
      Darr: "\u21A1",
      dArr: "\u21D3",
      darr: "\u2193",
      dash: "\u2010",
      Dashv: "\u2AE4",
      dashv: "\u22A3",
      dbkarow: "\u290F",
      dblac: "\u02DD",
      Dcaron: "\u010E",
      dcaron: "\u010F",
      Dcy: "\u0414",
      dcy: "\u0434",
      DD: "\u2145",
      dd: "\u2146",
      ddagger: "\u2021",
      ddarr: "\u21CA",
      DDotrahd: "\u2911",
      ddotseq: "\u2A77",
      deg: "\xB0",
      Del: "\u2207",
      Delta: "\u0394",
      delta: "\u03B4",
      demptyv: "\u29B1",
      dfisht: "\u297F",
      Dfr: "\u{1D507}",
      dfr: "\u{1D521}",
      dHar: "\u2965",
      dharl: "\u21C3",
      dharr: "\u21C2",
      DiacriticalAcute: "\xB4",
      DiacriticalDot: "\u02D9",
      DiacriticalDoubleAcute: "\u02DD",
      DiacriticalGrave: "`",
      DiacriticalTilde: "\u02DC",
      diam: "\u22C4",
      Diamond: "\u22C4",
      diamond: "\u22C4",
      diamondsuit: "\u2666",
      diams: "\u2666",
      die: "\xA8",
      DifferentialD: "\u2146",
      digamma: "\u03DD",
      disin: "\u22F2",
      div: "\xF7",
      divide: "\xF7",
      divideontimes: "\u22C7",
      divonx: "\u22C7",
      DJcy: "\u0402",
      djcy: "\u0452",
      dlcorn: "\u231E",
      dlcrop: "\u230D",
      dollar: "$",
      Dopf: "\u{1D53B}",
      dopf: "\u{1D555}",
      Dot: "\xA8",
      dot: "\u02D9",
      DotDot: "\u20DC",
      doteq: "\u2250",
      doteqdot: "\u2251",
      DotEqual: "\u2250",
      dotminus: "\u2238",
      dotplus: "\u2214",
      dotsquare: "\u22A1",
      doublebarwedge: "\u2306",
      DoubleContourIntegral: "\u222F",
      DoubleDot: "\xA8",
      DoubleDownArrow: "\u21D3",
      DoubleLeftArrow: "\u21D0",
      DoubleLeftRightArrow: "\u21D4",
      DoubleLeftTee: "\u2AE4",
      DoubleLongLeftArrow: "\u27F8",
      DoubleLongLeftRightArrow: "\u27FA",
      DoubleLongRightArrow: "\u27F9",
      DoubleRightArrow: "\u21D2",
      DoubleRightTee: "\u22A8",
      DoubleUpArrow: "\u21D1",
      DoubleUpDownArrow: "\u21D5",
      DoubleVerticalBar: "\u2225",
      DownArrow: "\u2193",
      Downarrow: "\u21D3",
      downarrow: "\u2193",
      DownArrowBar: "\u2913",
      DownArrowUpArrow: "\u21F5",
      DownBreve: "\u0311",
      downdownarrows: "\u21CA",
      downharpoonleft: "\u21C3",
      downharpoonright: "\u21C2",
      DownLeftRightVector: "\u2950",
      DownLeftTeeVector: "\u295E",
      DownLeftVector: "\u21BD",
      DownLeftVectorBar: "\u2956",
      DownRightTeeVector: "\u295F",
      DownRightVector: "\u21C1",
      DownRightVectorBar: "\u2957",
      DownTee: "\u22A4",
      DownTeeArrow: "\u21A7",
      drbkarow: "\u2910",
      drcorn: "\u231F",
      drcrop: "\u230C",
      Dscr: "\u{1D49F}",
      dscr: "\u{1D4B9}",
      DScy: "\u0405",
      dscy: "\u0455",
      dsol: "\u29F6",
      Dstrok: "\u0110",
      dstrok: "\u0111",
      dtdot: "\u22F1",
      dtri: "\u25BF",
      dtrif: "\u25BE",
      duarr: "\u21F5",
      duhar: "\u296F",
      dwangle: "\u29A6",
      DZcy: "\u040F",
      dzcy: "\u045F",
      dzigrarr: "\u27FF",
      Eacute: "\xC9",
      eacute: "\xE9",
      easter: "\u2A6E",
      Ecaron: "\u011A",
      ecaron: "\u011B",
      ecir: "\u2256",
      Ecirc: "\xCA",
      ecirc: "\xEA",
      ecolon: "\u2255",
      Ecy: "\u042D",
      ecy: "\u044D",
      eDDot: "\u2A77",
      Edot: "\u0116",
      eDot: "\u2251",
      edot: "\u0117",
      ee: "\u2147",
      efDot: "\u2252",
      Efr: "\u{1D508}",
      efr: "\u{1D522}",
      eg: "\u2A9A",
      Egrave: "\xC8",
      egrave: "\xE8",
      egs: "\u2A96",
      egsdot: "\u2A98",
      el: "\u2A99",
      Element: "\u2208",
      elinters: "\u23E7",
      ell: "\u2113",
      els: "\u2A95",
      elsdot: "\u2A97",
      Emacr: "\u0112",
      emacr: "\u0113",
      empty: "\u2205",
      emptyset: "\u2205",
      EmptySmallSquare: "\u25FB",
      emptyv: "\u2205",
      EmptyVerySmallSquare: "\u25AB",
      emsp: "\u2003",
      emsp13: "\u2004",
      emsp14: "\u2005",
      ENG: "\u014A",
      eng: "\u014B",
      ensp: "\u2002",
      Eogon: "\u0118",
      eogon: "\u0119",
      Eopf: "\u{1D53C}",
      eopf: "\u{1D556}",
      epar: "\u22D5",
      eparsl: "\u29E3",
      eplus: "\u2A71",
      epsi: "\u03B5",
      Epsilon: "\u0395",
      epsilon: "\u03B5",
      epsiv: "\u03F5",
      eqcirc: "\u2256",
      eqcolon: "\u2255",
      eqsim: "\u2242",
      eqslantgtr: "\u2A96",
      eqslantless: "\u2A95",
      Equal: "\u2A75",
      equals: "=",
      EqualTilde: "\u2242",
      equest: "\u225F",
      Equilibrium: "\u21CC",
      equiv: "\u2261",
      equivDD: "\u2A78",
      eqvparsl: "\u29E5",
      erarr: "\u2971",
      erDot: "\u2253",
      Escr: "\u2130",
      escr: "\u212F",
      esdot: "\u2250",
      Esim: "\u2A73",
      esim: "\u2242",
      Eta: "\u0397",
      eta: "\u03B7",
      ETH: "\xD0",
      eth: "\xF0",
      Euml: "\xCB",
      euml: "\xEB",
      euro: "\u20AC",
      excl: "!",
      exist: "\u2203",
      Exists: "\u2203",
      expectation: "\u2130",
      ExponentialE: "\u2147",
      exponentiale: "\u2147",
      fallingdotseq: "\u2252",
      Fcy: "\u0424",
      fcy: "\u0444",
      female: "\u2640",
      ffilig: "\uFB03",
      fflig: "\uFB00",
      ffllig: "\uFB04",
      Ffr: "\u{1D509}",
      ffr: "\u{1D523}",
      filig: "\uFB01",
      FilledSmallSquare: "\u25FC",
      FilledVerySmallSquare: "\u25AA",
      fjlig: "fj",
      flat: "\u266D",
      fllig: "\uFB02",
      fltns: "\u25B1",
      fnof: "\u0192",
      Fopf: "\u{1D53D}",
      fopf: "\u{1D557}",
      ForAll: "\u2200",
      forall: "\u2200",
      fork: "\u22D4",
      forkv: "\u2AD9",
      Fouriertrf: "\u2131",
      fpartint: "\u2A0D",
      frac12: "\xBD",
      frac13: "\u2153",
      frac14: "\xBC",
      frac15: "\u2155",
      frac16: "\u2159",
      frac18: "\u215B",
      frac23: "\u2154",
      frac25: "\u2156",
      frac34: "\xBE",
      frac35: "\u2157",
      frac38: "\u215C",
      frac45: "\u2158",
      frac56: "\u215A",
      frac58: "\u215D",
      frac78: "\u215E",
      frasl: "\u2044",
      frown: "\u2322",
      Fscr: "\u2131",
      fscr: "\u{1D4BB}",
      gacute: "\u01F5",
      Gamma: "\u0393",
      gamma: "\u03B3",
      Gammad: "\u03DC",
      gammad: "\u03DD",
      gap: "\u2A86",
      Gbreve: "\u011E",
      gbreve: "\u011F",
      Gcedil: "\u0122",
      Gcirc: "\u011C",
      gcirc: "\u011D",
      Gcy: "\u0413",
      gcy: "\u0433",
      Gdot: "\u0120",
      gdot: "\u0121",
      gE: "\u2267",
      ge: "\u2265",
      gEl: "\u2A8C",
      gel: "\u22DB",
      geq: "\u2265",
      geqq: "\u2267",
      geqslant: "\u2A7E",
      ges: "\u2A7E",
      gescc: "\u2AA9",
      gesdot: "\u2A80",
      gesdoto: "\u2A82",
      gesdotol: "\u2A84",
      gesl: "\u22DB\uFE00",
      gesles: "\u2A94",
      Gfr: "\u{1D50A}",
      gfr: "\u{1D524}",
      Gg: "\u22D9",
      gg: "\u226B",
      ggg: "\u22D9",
      gimel: "\u2137",
      GJcy: "\u0403",
      gjcy: "\u0453",
      gl: "\u2277",
      gla: "\u2AA5",
      glE: "\u2A92",
      glj: "\u2AA4",
      gnap: "\u2A8A",
      gnapprox: "\u2A8A",
      gnE: "\u2269",
      gne: "\u2A88",
      gneq: "\u2A88",
      gneqq: "\u2269",
      gnsim: "\u22E7",
      Gopf: "\u{1D53E}",
      gopf: "\u{1D558}",
      grave: "`",
      GreaterEqual: "\u2265",
      GreaterEqualLess: "\u22DB",
      GreaterFullEqual: "\u2267",
      GreaterGreater: "\u2AA2",
      GreaterLess: "\u2277",
      GreaterSlantEqual: "\u2A7E",
      GreaterTilde: "\u2273",
      Gscr: "\u{1D4A2}",
      gscr: "\u210A",
      gsim: "\u2273",
      gsime: "\u2A8E",
      gsiml: "\u2A90",
      Gt: "\u226B",
      GT: ">",
      gt: ">",
      gtcc: "\u2AA7",
      gtcir: "\u2A7A",
      gtdot: "\u22D7",
      gtlPar: "\u2995",
      gtquest: "\u2A7C",
      gtrapprox: "\u2A86",
      gtrarr: "\u2978",
      gtrdot: "\u22D7",
      gtreqless: "\u22DB",
      gtreqqless: "\u2A8C",
      gtrless: "\u2277",
      gtrsim: "\u2273",
      gvertneqq: "\u2269\uFE00",
      gvnE: "\u2269\uFE00",
      Hacek: "\u02C7",
      hairsp: "\u200A",
      half: "\xBD",
      hamilt: "\u210B",
      HARDcy: "\u042A",
      hardcy: "\u044A",
      hArr: "\u21D4",
      harr: "\u2194",
      harrcir: "\u2948",
      harrw: "\u21AD",
      Hat: "^",
      hbar: "\u210F",
      Hcirc: "\u0124",
      hcirc: "\u0125",
      hearts: "\u2665",
      heartsuit: "\u2665",
      hellip: "\u2026",
      hercon: "\u22B9",
      Hfr: "\u210C",
      hfr: "\u{1D525}",
      HilbertSpace: "\u210B",
      hksearow: "\u2925",
      hkswarow: "\u2926",
      hoarr: "\u21FF",
      homtht: "\u223B",
      hookleftarrow: "\u21A9",
      hookrightarrow: "\u21AA",
      Hopf: "\u210D",
      hopf: "\u{1D559}",
      horbar: "\u2015",
      HorizontalLine: "\u2500",
      Hscr: "\u210B",
      hscr: "\u{1D4BD}",
      hslash: "\u210F",
      Hstrok: "\u0126",
      hstrok: "\u0127",
      HumpDownHump: "\u224E",
      HumpEqual: "\u224F",
      hybull: "\u2043",
      hyphen: "\u2010",
      Iacute: "\xCD",
      iacute: "\xED",
      ic: "\u2063",
      Icirc: "\xCE",
      icirc: "\xEE",
      Icy: "\u0418",
      icy: "\u0438",
      Idot: "\u0130",
      IEcy: "\u0415",
      iecy: "\u0435",
      iexcl: "\xA1",
      iff: "\u21D4",
      Ifr: "\u2111",
      ifr: "\u{1D526}",
      Igrave: "\xCC",
      igrave: "\xEC",
      ii: "\u2148",
      iiiint: "\u2A0C",
      iiint: "\u222D",
      iinfin: "\u29DC",
      iiota: "\u2129",
      IJlig: "\u0132",
      ijlig: "\u0133",
      Im: "\u2111",
      Imacr: "\u012A",
      imacr: "\u012B",
      image: "\u2111",
      ImaginaryI: "\u2148",
      imagline: "\u2110",
      imagpart: "\u2111",
      imath: "\u0131",
      imof: "\u22B7",
      imped: "\u01B5",
      Implies: "\u21D2",
      in: "\u2208",
      incare: "\u2105",
      infin: "\u221E",
      infintie: "\u29DD",
      inodot: "\u0131",
      Int: "\u222C",
      int: "\u222B",
      intcal: "\u22BA",
      integers: "\u2124",
      Integral: "\u222B",
      intercal: "\u22BA",
      Intersection: "\u22C2",
      intlarhk: "\u2A17",
      intprod: "\u2A3C",
      InvisibleComma: "\u2063",
      InvisibleTimes: "\u2062",
      IOcy: "\u0401",
      iocy: "\u0451",
      Iogon: "\u012E",
      iogon: "\u012F",
      Iopf: "\u{1D540}",
      iopf: "\u{1D55A}",
      Iota: "\u0399",
      iota: "\u03B9",
      iprod: "\u2A3C",
      iquest: "\xBF",
      Iscr: "\u2110",
      iscr: "\u{1D4BE}",
      isin: "\u2208",
      isindot: "\u22F5",
      isinE: "\u22F9",
      isins: "\u22F4",
      isinsv: "\u22F3",
      isinv: "\u2208",
      it: "\u2062",
      Itilde: "\u0128",
      itilde: "\u0129",
      Iukcy: "\u0406",
      iukcy: "\u0456",
      Iuml: "\xCF",
      iuml: "\xEF",
      Jcirc: "\u0134",
      jcirc: "\u0135",
      Jcy: "\u0419",
      jcy: "\u0439",
      Jfr: "\u{1D50D}",
      jfr: "\u{1D527}",
      jmath: "\u0237",
      Jopf: "\u{1D541}",
      jopf: "\u{1D55B}",
      Jscr: "\u{1D4A5}",
      jscr: "\u{1D4BF}",
      Jsercy: "\u0408",
      jsercy: "\u0458",
      Jukcy: "\u0404",
      jukcy: "\u0454",
      Kappa: "\u039A",
      kappa: "\u03BA",
      kappav: "\u03F0",
      Kcedil: "\u0136",
      kcedil: "\u0137",
      Kcy: "\u041A",
      kcy: "\u043A",
      Kfr: "\u{1D50E}",
      kfr: "\u{1D528}",
      kgreen: "\u0138",
      KHcy: "\u0425",
      khcy: "\u0445",
      KJcy: "\u040C",
      kjcy: "\u045C",
      Kopf: "\u{1D542}",
      kopf: "\u{1D55C}",
      Kscr: "\u{1D4A6}",
      kscr: "\u{1D4C0}",
      lAarr: "\u21DA",
      Lacute: "\u0139",
      lacute: "\u013A",
      laemptyv: "\u29B4",
      lagran: "\u2112",
      Lambda: "\u039B",
      lambda: "\u03BB",
      Lang: "\u27EA",
      lang: "\u27E8",
      langd: "\u2991",
      langle: "\u27E8",
      lap: "\u2A85",
      Laplacetrf: "\u2112",
      laquo: "\xAB",
      Larr: "\u219E",
      lArr: "\u21D0",
      larr: "\u2190",
      larrb: "\u21E4",
      larrbfs: "\u291F",
      larrfs: "\u291D",
      larrhk: "\u21A9",
      larrlp: "\u21AB",
      larrpl: "\u2939",
      larrsim: "\u2973",
      larrtl: "\u21A2",
      lat: "\u2AAB",
      lAtail: "\u291B",
      latail: "\u2919",
      late: "\u2AAD",
      lates: "\u2AAD\uFE00",
      lBarr: "\u290E",
      lbarr: "\u290C",
      lbbrk: "\u2772",
      lbrace: "{",
      lbrack: "[",
      lbrke: "\u298B",
      lbrksld: "\u298F",
      lbrkslu: "\u298D",
      Lcaron: "\u013D",
      lcaron: "\u013E",
      Lcedil: "\u013B",
      lcedil: "\u013C",
      lceil: "\u2308",
      lcub: "{",
      Lcy: "\u041B",
      lcy: "\u043B",
      ldca: "\u2936",
      ldquo: "\u201C",
      ldquor: "\u201E",
      ldrdhar: "\u2967",
      ldrushar: "\u294B",
      ldsh: "\u21B2",
      lE: "\u2266",
      le: "\u2264",
      LeftAngleBracket: "\u27E8",
      LeftArrow: "\u2190",
      Leftarrow: "\u21D0",
      leftarrow: "\u2190",
      LeftArrowBar: "\u21E4",
      LeftArrowRightArrow: "\u21C6",
      leftarrowtail: "\u21A2",
      LeftCeiling: "\u2308",
      LeftDoubleBracket: "\u27E6",
      LeftDownTeeVector: "\u2961",
      LeftDownVector: "\u21C3",
      LeftDownVectorBar: "\u2959",
      LeftFloor: "\u230A",
      leftharpoondown: "\u21BD",
      leftharpoonup: "\u21BC",
      leftleftarrows: "\u21C7",
      LeftRightArrow: "\u2194",
      Leftrightarrow: "\u21D4",
      leftrightarrow: "\u2194",
      leftrightarrows: "\u21C6",
      leftrightharpoons: "\u21CB",
      leftrightsquigarrow: "\u21AD",
      LeftRightVector: "\u294E",
      LeftTee: "\u22A3",
      LeftTeeArrow: "\u21A4",
      LeftTeeVector: "\u295A",
      leftthreetimes: "\u22CB",
      LeftTriangle: "\u22B2",
      LeftTriangleBar: "\u29CF",
      LeftTriangleEqual: "\u22B4",
      LeftUpDownVector: "\u2951",
      LeftUpTeeVector: "\u2960",
      LeftUpVector: "\u21BF",
      LeftUpVectorBar: "\u2958",
      LeftVector: "\u21BC",
      LeftVectorBar: "\u2952",
      lEg: "\u2A8B",
      leg: "\u22DA",
      leq: "\u2264",
      leqq: "\u2266",
      leqslant: "\u2A7D",
      les: "\u2A7D",
      lescc: "\u2AA8",
      lesdot: "\u2A7F",
      lesdoto: "\u2A81",
      lesdotor: "\u2A83",
      lesg: "\u22DA\uFE00",
      lesges: "\u2A93",
      lessapprox: "\u2A85",
      lessdot: "\u22D6",
      lesseqgtr: "\u22DA",
      lesseqqgtr: "\u2A8B",
      LessEqualGreater: "\u22DA",
      LessFullEqual: "\u2266",
      LessGreater: "\u2276",
      lessgtr: "\u2276",
      LessLess: "\u2AA1",
      lesssim: "\u2272",
      LessSlantEqual: "\u2A7D",
      LessTilde: "\u2272",
      lfisht: "\u297C",
      lfloor: "\u230A",
      Lfr: "\u{1D50F}",
      lfr: "\u{1D529}",
      lg: "\u2276",
      lgE: "\u2A91",
      lHar: "\u2962",
      lhard: "\u21BD",
      lharu: "\u21BC",
      lharul: "\u296A",
      lhblk: "\u2584",
      LJcy: "\u0409",
      ljcy: "\u0459",
      Ll: "\u22D8",
      ll: "\u226A",
      llarr: "\u21C7",
      llcorner: "\u231E",
      Lleftarrow: "\u21DA",
      llhard: "\u296B",
      lltri: "\u25FA",
      Lmidot: "\u013F",
      lmidot: "\u0140",
      lmoust: "\u23B0",
      lmoustache: "\u23B0",
      lnap: "\u2A89",
      lnapprox: "\u2A89",
      lnE: "\u2268",
      lne: "\u2A87",
      lneq: "\u2A87",
      lneqq: "\u2268",
      lnsim: "\u22E6",
      loang: "\u27EC",
      loarr: "\u21FD",
      lobrk: "\u27E6",
      LongLeftArrow: "\u27F5",
      Longleftarrow: "\u27F8",
      longleftarrow: "\u27F5",
      LongLeftRightArrow: "\u27F7",
      Longleftrightarrow: "\u27FA",
      longleftrightarrow: "\u27F7",
      longmapsto: "\u27FC",
      LongRightArrow: "\u27F6",
      Longrightarrow: "\u27F9",
      longrightarrow: "\u27F6",
      looparrowleft: "\u21AB",
      looparrowright: "\u21AC",
      lopar: "\u2985",
      Lopf: "\u{1D543}",
      lopf: "\u{1D55D}",
      loplus: "\u2A2D",
      lotimes: "\u2A34",
      lowast: "\u2217",
      lowbar: "_",
      LowerLeftArrow: "\u2199",
      LowerRightArrow: "\u2198",
      loz: "\u25CA",
      lozenge: "\u25CA",
      lozf: "\u29EB",
      lpar: "(",
      lparlt: "\u2993",
      lrarr: "\u21C6",
      lrcorner: "\u231F",
      lrhar: "\u21CB",
      lrhard: "\u296D",
      lrm: "\u200E",
      lrtri: "\u22BF",
      lsaquo: "\u2039",
      Lscr: "\u2112",
      lscr: "\u{1D4C1}",
      Lsh: "\u21B0",
      lsh: "\u21B0",
      lsim: "\u2272",
      lsime: "\u2A8D",
      lsimg: "\u2A8F",
      lsqb: "[",
      lsquo: "\u2018",
      lsquor: "\u201A",
      Lstrok: "\u0141",
      lstrok: "\u0142",
      Lt: "\u226A",
      LT: "<",
      lt: "<",
      ltcc: "\u2AA6",
      ltcir: "\u2A79",
      ltdot: "\u22D6",
      lthree: "\u22CB",
      ltimes: "\u22C9",
      ltlarr: "\u2976",
      ltquest: "\u2A7B",
      ltri: "\u25C3",
      ltrie: "\u22B4",
      ltrif: "\u25C2",
      ltrPar: "\u2996",
      lurdshar: "\u294A",
      luruhar: "\u2966",
      lvertneqq: "\u2268\uFE00",
      lvnE: "\u2268\uFE00",
      macr: "\xAF",
      male: "\u2642",
      malt: "\u2720",
      maltese: "\u2720",
      Map: "\u2905",
      map: "\u21A6",
      mapsto: "\u21A6",
      mapstodown: "\u21A7",
      mapstoleft: "\u21A4",
      mapstoup: "\u21A5",
      marker: "\u25AE",
      mcomma: "\u2A29",
      Mcy: "\u041C",
      mcy: "\u043C",
      mdash: "\u2014",
      mDDot: "\u223A",
      measuredangle: "\u2221",
      MediumSpace: "\u205F",
      Mellintrf: "\u2133",
      Mfr: "\u{1D510}",
      mfr: "\u{1D52A}",
      mho: "\u2127",
      micro: "\xB5",
      mid: "\u2223",
      midast: "*",
      midcir: "\u2AF0",
      middot: "\xB7",
      minus: "\u2212",
      minusb: "\u229F",
      minusd: "\u2238",
      minusdu: "\u2A2A",
      MinusPlus: "\u2213",
      mlcp: "\u2ADB",
      mldr: "\u2026",
      mnplus: "\u2213",
      models: "\u22A7",
      Mopf: "\u{1D544}",
      mopf: "\u{1D55E}",
      mp: "\u2213",
      Mscr: "\u2133",
      mscr: "\u{1D4C2}",
      mstpos: "\u223E",
      Mu: "\u039C",
      mu: "\u03BC",
      multimap: "\u22B8",
      mumap: "\u22B8",
      nabla: "\u2207",
      Nacute: "\u0143",
      nacute: "\u0144",
      nang: "\u2220\u20D2",
      nap: "\u2249",
      napE: "\u2A70\u0338",
      napid: "\u224B\u0338",
      napos: "\u0149",
      napprox: "\u2249",
      natur: "\u266E",
      natural: "\u266E",
      naturals: "\u2115",
      nbsp: "\xA0",
      nbump: "\u224E\u0338",
      nbumpe: "\u224F\u0338",
      ncap: "\u2A43",
      Ncaron: "\u0147",
      ncaron: "\u0148",
      Ncedil: "\u0145",
      ncedil: "\u0146",
      ncong: "\u2247",
      ncongdot: "\u2A6D\u0338",
      ncup: "\u2A42",
      Ncy: "\u041D",
      ncy: "\u043D",
      ndash: "\u2013",
      ne: "\u2260",
      nearhk: "\u2924",
      neArr: "\u21D7",
      nearr: "\u2197",
      nearrow: "\u2197",
      nedot: "\u2250\u0338",
      NegativeMediumSpace: "\u200B",
      NegativeThickSpace: "\u200B",
      NegativeThinSpace: "\u200B",
      NegativeVeryThinSpace: "\u200B",
      nequiv: "\u2262",
      nesear: "\u2928",
      nesim: "\u2242\u0338",
      NestedGreaterGreater: "\u226B",
      NestedLessLess: "\u226A",
      NewLine: "\n",
      nexist: "\u2204",
      nexists: "\u2204",
      Nfr: "\u{1D511}",
      nfr: "\u{1D52B}",
      ngE: "\u2267\u0338",
      nge: "\u2271",
      ngeq: "\u2271",
      ngeqq: "\u2267\u0338",
      ngeqslant: "\u2A7E\u0338",
      nges: "\u2A7E\u0338",
      nGg: "\u22D9\u0338",
      ngsim: "\u2275",
      nGt: "\u226B\u20D2",
      ngt: "\u226F",
      ngtr: "\u226F",
      nGtv: "\u226B\u0338",
      nhArr: "\u21CE",
      nharr: "\u21AE",
      nhpar: "\u2AF2",
      ni: "\u220B",
      nis: "\u22FC",
      nisd: "\u22FA",
      niv: "\u220B",
      NJcy: "\u040A",
      njcy: "\u045A",
      nlArr: "\u21CD",
      nlarr: "\u219A",
      nldr: "\u2025",
      nlE: "\u2266\u0338",
      nle: "\u2270",
      nLeftarrow: "\u21CD",
      nleftarrow: "\u219A",
      nLeftrightarrow: "\u21CE",
      nleftrightarrow: "\u21AE",
      nleq: "\u2270",
      nleqq: "\u2266\u0338",
      nleqslant: "\u2A7D\u0338",
      nles: "\u2A7D\u0338",
      nless: "\u226E",
      nLl: "\u22D8\u0338",
      nlsim: "\u2274",
      nLt: "\u226A\u20D2",
      nlt: "\u226E",
      nltri: "\u22EA",
      nltrie: "\u22EC",
      nLtv: "\u226A\u0338",
      nmid: "\u2224",
      NoBreak: "\u2060",
      NonBreakingSpace: "\xA0",
      Nopf: "\u2115",
      nopf: "\u{1D55F}",
      Not: "\u2AEC",
      not: "\xAC",
      NotCongruent: "\u2262",
      NotCupCap: "\u226D",
      NotDoubleVerticalBar: "\u2226",
      NotElement: "\u2209",
      NotEqual: "\u2260",
      NotEqualTilde: "\u2242\u0338",
      NotExists: "\u2204",
      NotGreater: "\u226F",
      NotGreaterEqual: "\u2271",
      NotGreaterFullEqual: "\u2267\u0338",
      NotGreaterGreater: "\u226B\u0338",
      NotGreaterLess: "\u2279",
      NotGreaterSlantEqual: "\u2A7E\u0338",
      NotGreaterTilde: "\u2275",
      NotHumpDownHump: "\u224E\u0338",
      NotHumpEqual: "\u224F\u0338",
      notin: "\u2209",
      notindot: "\u22F5\u0338",
      notinE: "\u22F9\u0338",
      notinva: "\u2209",
      notinvb: "\u22F7",
      notinvc: "\u22F6",
      NotLeftTriangle: "\u22EA",
      NotLeftTriangleBar: "\u29CF\u0338",
      NotLeftTriangleEqual: "\u22EC",
      NotLess: "\u226E",
      NotLessEqual: "\u2270",
      NotLessGreater: "\u2278",
      NotLessLess: "\u226A\u0338",
      NotLessSlantEqual: "\u2A7D\u0338",
      NotLessTilde: "\u2274",
      NotNestedGreaterGreater: "\u2AA2\u0338",
      NotNestedLessLess: "\u2AA1\u0338",
      notni: "\u220C",
      notniva: "\u220C",
      notnivb: "\u22FE",
      notnivc: "\u22FD",
      NotPrecedes: "\u2280",
      NotPrecedesEqual: "\u2AAF\u0338",
      NotPrecedesSlantEqual: "\u22E0",
      NotReverseElement: "\u220C",
      NotRightTriangle: "\u22EB",
      NotRightTriangleBar: "\u29D0\u0338",
      NotRightTriangleEqual: "\u22ED",
      NotSquareSubset: "\u228F\u0338",
      NotSquareSubsetEqual: "\u22E2",
      NotSquareSuperset: "\u2290\u0338",
      NotSquareSupersetEqual: "\u22E3",
      NotSubset: "\u2282\u20D2",
      NotSubsetEqual: "\u2288",
      NotSucceeds: "\u2281",
      NotSucceedsEqual: "\u2AB0\u0338",
      NotSucceedsSlantEqual: "\u22E1",
      NotSucceedsTilde: "\u227F\u0338",
      NotSuperset: "\u2283\u20D2",
      NotSupersetEqual: "\u2289",
      NotTilde: "\u2241",
      NotTildeEqual: "\u2244",
      NotTildeFullEqual: "\u2247",
      NotTildeTilde: "\u2249",
      NotVerticalBar: "\u2224",
      npar: "\u2226",
      nparallel: "\u2226",
      nparsl: "\u2AFD\u20E5",
      npart: "\u2202\u0338",
      npolint: "\u2A14",
      npr: "\u2280",
      nprcue: "\u22E0",
      npre: "\u2AAF\u0338",
      nprec: "\u2280",
      npreceq: "\u2AAF\u0338",
      nrArr: "\u21CF",
      nrarr: "\u219B",
      nrarrc: "\u2933\u0338",
      nrarrw: "\u219D\u0338",
      nRightarrow: "\u21CF",
      nrightarrow: "\u219B",
      nrtri: "\u22EB",
      nrtrie: "\u22ED",
      nsc: "\u2281",
      nsccue: "\u22E1",
      nsce: "\u2AB0\u0338",
      Nscr: "\u{1D4A9}",
      nscr: "\u{1D4C3}",
      nshortmid: "\u2224",
      nshortparallel: "\u2226",
      nsim: "\u2241",
      nsime: "\u2244",
      nsimeq: "\u2244",
      nsmid: "\u2224",
      nspar: "\u2226",
      nsqsube: "\u22E2",
      nsqsupe: "\u22E3",
      nsub: "\u2284",
      nsubE: "\u2AC5\u0338",
      nsube: "\u2288",
      nsubset: "\u2282\u20D2",
      nsubseteq: "\u2288",
      nsubseteqq: "\u2AC5\u0338",
      nsucc: "\u2281",
      nsucceq: "\u2AB0\u0338",
      nsup: "\u2285",
      nsupE: "\u2AC6\u0338",
      nsupe: "\u2289",
      nsupset: "\u2283\u20D2",
      nsupseteq: "\u2289",
      nsupseteqq: "\u2AC6\u0338",
      ntgl: "\u2279",
      Ntilde: "\xD1",
      ntilde: "\xF1",
      ntlg: "\u2278",
      ntriangleleft: "\u22EA",
      ntrianglelefteq: "\u22EC",
      ntriangleright: "\u22EB",
      ntrianglerighteq: "\u22ED",
      Nu: "\u039D",
      nu: "\u03BD",
      num: "#",
      numero: "\u2116",
      numsp: "\u2007",
      nvap: "\u224D\u20D2",
      nVDash: "\u22AF",
      nVdash: "\u22AE",
      nvDash: "\u22AD",
      nvdash: "\u22AC",
      nvge: "\u2265\u20D2",
      nvgt: ">\u20D2",
      nvHarr: "\u2904",
      nvinfin: "\u29DE",
      nvlArr: "\u2902",
      nvle: "\u2264\u20D2",
      nvlt: "<\u20D2",
      nvltrie: "\u22B4\u20D2",
      nvrArr: "\u2903",
      nvrtrie: "\u22B5\u20D2",
      nvsim: "\u223C\u20D2",
      nwarhk: "\u2923",
      nwArr: "\u21D6",
      nwarr: "\u2196",
      nwarrow: "\u2196",
      nwnear: "\u2927",
      Oacute: "\xD3",
      oacute: "\xF3",
      oast: "\u229B",
      ocir: "\u229A",
      Ocirc: "\xD4",
      ocirc: "\xF4",
      Ocy: "\u041E",
      ocy: "\u043E",
      odash: "\u229D",
      Odblac: "\u0150",
      odblac: "\u0151",
      odiv: "\u2A38",
      odot: "\u2299",
      odsold: "\u29BC",
      OElig: "\u0152",
      oelig: "\u0153",
      ofcir: "\u29BF",
      Ofr: "\u{1D512}",
      ofr: "\u{1D52C}",
      ogon: "\u02DB",
      Ograve: "\xD2",
      ograve: "\xF2",
      ogt: "\u29C1",
      ohbar: "\u29B5",
      ohm: "\u03A9",
      oint: "\u222E",
      olarr: "\u21BA",
      olcir: "\u29BE",
      olcross: "\u29BB",
      oline: "\u203E",
      olt: "\u29C0",
      Omacr: "\u014C",
      omacr: "\u014D",
      Omega: "\u03A9",
      omega: "\u03C9",
      Omicron: "\u039F",
      omicron: "\u03BF",
      omid: "\u29B6",
      ominus: "\u2296",
      Oopf: "\u{1D546}",
      oopf: "\u{1D560}",
      opar: "\u29B7",
      OpenCurlyDoubleQuote: "\u201C",
      OpenCurlyQuote: "\u2018",
      operp: "\u29B9",
      oplus: "\u2295",
      Or: "\u2A54",
      or: "\u2228",
      orarr: "\u21BB",
      ord: "\u2A5D",
      order: "\u2134",
      orderof: "\u2134",
      ordf: "\xAA",
      ordm: "\xBA",
      origof: "\u22B6",
      oror: "\u2A56",
      orslope: "\u2A57",
      orv: "\u2A5B",
      oS: "\u24C8",
      Oscr: "\u{1D4AA}",
      oscr: "\u2134",
      Oslash: "\xD8",
      oslash: "\xF8",
      osol: "\u2298",
      Otilde: "\xD5",
      otilde: "\xF5",
      Otimes: "\u2A37",
      otimes: "\u2297",
      otimesas: "\u2A36",
      Ouml: "\xD6",
      ouml: "\xF6",
      ovbar: "\u233D",
      OverBar: "\u203E",
      OverBrace: "\u23DE",
      OverBracket: "\u23B4",
      OverParenthesis: "\u23DC",
      par: "\u2225",
      para: "\xB6",
      parallel: "\u2225",
      parsim: "\u2AF3",
      parsl: "\u2AFD",
      part: "\u2202",
      PartialD: "\u2202",
      Pcy: "\u041F",
      pcy: "\u043F",
      percnt: "%",
      period: ".",
      permil: "\u2030",
      perp: "\u22A5",
      pertenk: "\u2031",
      Pfr: "\u{1D513}",
      pfr: "\u{1D52D}",
      Phi: "\u03A6",
      phi: "\u03C6",
      phiv: "\u03D5",
      phmmat: "\u2133",
      phone: "\u260E",
      Pi: "\u03A0",
      pi: "\u03C0",
      pitchfork: "\u22D4",
      piv: "\u03D6",
      planck: "\u210F",
      planckh: "\u210E",
      plankv: "\u210F",
      plus: "+",
      plusacir: "\u2A23",
      plusb: "\u229E",
      pluscir: "\u2A22",
      plusdo: "\u2214",
      plusdu: "\u2A25",
      pluse: "\u2A72",
      PlusMinus: "\xB1",
      plusmn: "\xB1",
      plussim: "\u2A26",
      plustwo: "\u2A27",
      pm: "\xB1",
      Poincareplane: "\u210C",
      pointint: "\u2A15",
      Popf: "\u2119",
      popf: "\u{1D561}",
      pound: "\xA3",
      Pr: "\u2ABB",
      pr: "\u227A",
      prap: "\u2AB7",
      prcue: "\u227C",
      prE: "\u2AB3",
      pre: "\u2AAF",
      prec: "\u227A",
      precapprox: "\u2AB7",
      preccurlyeq: "\u227C",
      Precedes: "\u227A",
      PrecedesEqual: "\u2AAF",
      PrecedesSlantEqual: "\u227C",
      PrecedesTilde: "\u227E",
      preceq: "\u2AAF",
      precnapprox: "\u2AB9",
      precneqq: "\u2AB5",
      precnsim: "\u22E8",
      precsim: "\u227E",
      Prime: "\u2033",
      prime: "\u2032",
      primes: "\u2119",
      prnap: "\u2AB9",
      prnE: "\u2AB5",
      prnsim: "\u22E8",
      prod: "\u220F",
      Product: "\u220F",
      profalar: "\u232E",
      profline: "\u2312",
      profsurf: "\u2313",
      prop: "\u221D",
      Proportion: "\u2237",
      Proportional: "\u221D",
      propto: "\u221D",
      prsim: "\u227E",
      prurel: "\u22B0",
      Pscr: "\u{1D4AB}",
      pscr: "\u{1D4C5}",
      Psi: "\u03A8",
      psi: "\u03C8",
      puncsp: "\u2008",
      Qfr: "\u{1D514}",
      qfr: "\u{1D52E}",
      qint: "\u2A0C",
      Qopf: "\u211A",
      qopf: "\u{1D562}",
      qprime: "\u2057",
      Qscr: "\u{1D4AC}",
      qscr: "\u{1D4C6}",
      quaternions: "\u210D",
      quatint: "\u2A16",
      quest: "?",
      questeq: "\u225F",
      QUOT: '"',
      quot: '"',
      rAarr: "\u21DB",
      race: "\u223D\u0331",
      Racute: "\u0154",
      racute: "\u0155",
      radic: "\u221A",
      raemptyv: "\u29B3",
      Rang: "\u27EB",
      rang: "\u27E9",
      rangd: "\u2992",
      range: "\u29A5",
      rangle: "\u27E9",
      raquo: "\xBB",
      Rarr: "\u21A0",
      rArr: "\u21D2",
      rarr: "\u2192",
      rarrap: "\u2975",
      rarrb: "\u21E5",
      rarrbfs: "\u2920",
      rarrc: "\u2933",
      rarrfs: "\u291E",
      rarrhk: "\u21AA",
      rarrlp: "\u21AC",
      rarrpl: "\u2945",
      rarrsim: "\u2974",
      Rarrtl: "\u2916",
      rarrtl: "\u21A3",
      rarrw: "\u219D",
      rAtail: "\u291C",
      ratail: "\u291A",
      ratio: "\u2236",
      rationals: "\u211A",
      RBarr: "\u2910",
      rBarr: "\u290F",
      rbarr: "\u290D",
      rbbrk: "\u2773",
      rbrace: "}",
      rbrack: "]",
      rbrke: "\u298C",
      rbrksld: "\u298E",
      rbrkslu: "\u2990",
      Rcaron: "\u0158",
      rcaron: "\u0159",
      Rcedil: "\u0156",
      rcedil: "\u0157",
      rceil: "\u2309",
      rcub: "}",
      Rcy: "\u0420",
      rcy: "\u0440",
      rdca: "\u2937",
      rdldhar: "\u2969",
      rdquo: "\u201D",
      rdquor: "\u201D",
      rdsh: "\u21B3",
      Re: "\u211C",
      real: "\u211C",
      realine: "\u211B",
      realpart: "\u211C",
      reals: "\u211D",
      rect: "\u25AD",
      REG: "\xAE",
      reg: "\xAE",
      ReverseElement: "\u220B",
      ReverseEquilibrium: "\u21CB",
      ReverseUpEquilibrium: "\u296F",
      rfisht: "\u297D",
      rfloor: "\u230B",
      Rfr: "\u211C",
      rfr: "\u{1D52F}",
      rHar: "\u2964",
      rhard: "\u21C1",
      rharu: "\u21C0",
      rharul: "\u296C",
      Rho: "\u03A1",
      rho: "\u03C1",
      rhov: "\u03F1",
      RightAngleBracket: "\u27E9",
      RightArrow: "\u2192",
      Rightarrow: "\u21D2",
      rightarrow: "\u2192",
      RightArrowBar: "\u21E5",
      RightArrowLeftArrow: "\u21C4",
      rightarrowtail: "\u21A3",
      RightCeiling: "\u2309",
      RightDoubleBracket: "\u27E7",
      RightDownTeeVector: "\u295D",
      RightDownVector: "\u21C2",
      RightDownVectorBar: "\u2955",
      RightFloor: "\u230B",
      rightharpoondown: "\u21C1",
      rightharpoonup: "\u21C0",
      rightleftarrows: "\u21C4",
      rightleftharpoons: "\u21CC",
      rightrightarrows: "\u21C9",
      rightsquigarrow: "\u219D",
      RightTee: "\u22A2",
      RightTeeArrow: "\u21A6",
      RightTeeVector: "\u295B",
      rightthreetimes: "\u22CC",
      RightTriangle: "\u22B3",
      RightTriangleBar: "\u29D0",
      RightTriangleEqual: "\u22B5",
      RightUpDownVector: "\u294F",
      RightUpTeeVector: "\u295C",
      RightUpVector: "\u21BE",
      RightUpVectorBar: "\u2954",
      RightVector: "\u21C0",
      RightVectorBar: "\u2953",
      ring: "\u02DA",
      risingdotseq: "\u2253",
      rlarr: "\u21C4",
      rlhar: "\u21CC",
      rlm: "\u200F",
      rmoust: "\u23B1",
      rmoustache: "\u23B1",
      rnmid: "\u2AEE",
      roang: "\u27ED",
      roarr: "\u21FE",
      robrk: "\u27E7",
      ropar: "\u2986",
      Ropf: "\u211D",
      ropf: "\u{1D563}",
      roplus: "\u2A2E",
      rotimes: "\u2A35",
      RoundImplies: "\u2970",
      rpar: ")",
      rpargt: "\u2994",
      rppolint: "\u2A12",
      rrarr: "\u21C9",
      Rrightarrow: "\u21DB",
      rsaquo: "\u203A",
      Rscr: "\u211B",
      rscr: "\u{1D4C7}",
      Rsh: "\u21B1",
      rsh: "\u21B1",
      rsqb: "]",
      rsquo: "\u2019",
      rsquor: "\u2019",
      rthree: "\u22CC",
      rtimes: "\u22CA",
      rtri: "\u25B9",
      rtrie: "\u22B5",
      rtrif: "\u25B8",
      rtriltri: "\u29CE",
      RuleDelayed: "\u29F4",
      ruluhar: "\u2968",
      rx: "\u211E",
      Sacute: "\u015A",
      sacute: "\u015B",
      sbquo: "\u201A",
      Sc: "\u2ABC",
      sc: "\u227B",
      scap: "\u2AB8",
      Scaron: "\u0160",
      scaron: "\u0161",
      sccue: "\u227D",
      scE: "\u2AB4",
      sce: "\u2AB0",
      Scedil: "\u015E",
      scedil: "\u015F",
      Scirc: "\u015C",
      scirc: "\u015D",
      scnap: "\u2ABA",
      scnE: "\u2AB6",
      scnsim: "\u22E9",
      scpolint: "\u2A13",
      scsim: "\u227F",
      Scy: "\u0421",
      scy: "\u0441",
      sdot: "\u22C5",
      sdotb: "\u22A1",
      sdote: "\u2A66",
      searhk: "\u2925",
      seArr: "\u21D8",
      searr: "\u2198",
      searrow: "\u2198",
      sect: "\xA7",
      semi: ";",
      seswar: "\u2929",
      setminus: "\u2216",
      setmn: "\u2216",
      sext: "\u2736",
      Sfr: "\u{1D516}",
      sfr: "\u{1D530}",
      sfrown: "\u2322",
      sharp: "\u266F",
      SHCHcy: "\u0429",
      shchcy: "\u0449",
      SHcy: "\u0428",
      shcy: "\u0448",
      ShortDownArrow: "\u2193",
      ShortLeftArrow: "\u2190",
      shortmid: "\u2223",
      shortparallel: "\u2225",
      ShortRightArrow: "\u2192",
      ShortUpArrow: "\u2191",
      shy: "\xAD",
      Sigma: "\u03A3",
      sigma: "\u03C3",
      sigmaf: "\u03C2",
      sigmav: "\u03C2",
      sim: "\u223C",
      simdot: "\u2A6A",
      sime: "\u2243",
      simeq: "\u2243",
      simg: "\u2A9E",
      simgE: "\u2AA0",
      siml: "\u2A9D",
      simlE: "\u2A9F",
      simne: "\u2246",
      simplus: "\u2A24",
      simrarr: "\u2972",
      slarr: "\u2190",
      SmallCircle: "\u2218",
      smallsetminus: "\u2216",
      smashp: "\u2A33",
      smeparsl: "\u29E4",
      smid: "\u2223",
      smile: "\u2323",
      smt: "\u2AAA",
      smte: "\u2AAC",
      smtes: "\u2AAC\uFE00",
      SOFTcy: "\u042C",
      softcy: "\u044C",
      sol: "/",
      solb: "\u29C4",
      solbar: "\u233F",
      Sopf: "\u{1D54A}",
      sopf: "\u{1D564}",
      spades: "\u2660",
      spadesuit: "\u2660",
      spar: "\u2225",
      sqcap: "\u2293",
      sqcaps: "\u2293\uFE00",
      sqcup: "\u2294",
      sqcups: "\u2294\uFE00",
      Sqrt: "\u221A",
      sqsub: "\u228F",
      sqsube: "\u2291",
      sqsubset: "\u228F",
      sqsubseteq: "\u2291",
      sqsup: "\u2290",
      sqsupe: "\u2292",
      sqsupset: "\u2290",
      sqsupseteq: "\u2292",
      squ: "\u25A1",
      Square: "\u25A1",
      square: "\u25A1",
      SquareIntersection: "\u2293",
      SquareSubset: "\u228F",
      SquareSubsetEqual: "\u2291",
      SquareSuperset: "\u2290",
      SquareSupersetEqual: "\u2292",
      SquareUnion: "\u2294",
      squarf: "\u25AA",
      squf: "\u25AA",
      srarr: "\u2192",
      Sscr: "\u{1D4AE}",
      sscr: "\u{1D4C8}",
      ssetmn: "\u2216",
      ssmile: "\u2323",
      sstarf: "\u22C6",
      Star: "\u22C6",
      star: "\u2606",
      starf: "\u2605",
      straightepsilon: "\u03F5",
      straightphi: "\u03D5",
      strns: "\xAF",
      Sub: "\u22D0",
      sub: "\u2282",
      subdot: "\u2ABD",
      subE: "\u2AC5",
      sube: "\u2286",
      subedot: "\u2AC3",
      submult: "\u2AC1",
      subnE: "\u2ACB",
      subne: "\u228A",
      subplus: "\u2ABF",
      subrarr: "\u2979",
      Subset: "\u22D0",
      subset: "\u2282",
      subseteq: "\u2286",
      subseteqq: "\u2AC5",
      SubsetEqual: "\u2286",
      subsetneq: "\u228A",
      subsetneqq: "\u2ACB",
      subsim: "\u2AC7",
      subsub: "\u2AD5",
      subsup: "\u2AD3",
      succ: "\u227B",
      succapprox: "\u2AB8",
      succcurlyeq: "\u227D",
      Succeeds: "\u227B",
      SucceedsEqual: "\u2AB0",
      SucceedsSlantEqual: "\u227D",
      SucceedsTilde: "\u227F",
      succeq: "\u2AB0",
      succnapprox: "\u2ABA",
      succneqq: "\u2AB6",
      succnsim: "\u22E9",
      succsim: "\u227F",
      SuchThat: "\u220B",
      Sum: "\u2211",
      sum: "\u2211",
      sung: "\u266A",
      Sup: "\u22D1",
      sup: "\u2283",
      sup1: "\xB9",
      sup2: "\xB2",
      sup3: "\xB3",
      supdot: "\u2ABE",
      supdsub: "\u2AD8",
      supE: "\u2AC6",
      supe: "\u2287",
      supedot: "\u2AC4",
      Superset: "\u2283",
      SupersetEqual: "\u2287",
      suphsol: "\u27C9",
      suphsub: "\u2AD7",
      suplarr: "\u297B",
      supmult: "\u2AC2",
      supnE: "\u2ACC",
      supne: "\u228B",
      supplus: "\u2AC0",
      Supset: "\u22D1",
      supset: "\u2283",
      supseteq: "\u2287",
      supseteqq: "\u2AC6",
      supsetneq: "\u228B",
      supsetneqq: "\u2ACC",
      supsim: "\u2AC8",
      supsub: "\u2AD4",
      supsup: "\u2AD6",
      swarhk: "\u2926",
      swArr: "\u21D9",
      swarr: "\u2199",
      swarrow: "\u2199",
      swnwar: "\u292A",
      szlig: "\xDF",
      Tab: "	",
      target: "\u2316",
      Tau: "\u03A4",
      tau: "\u03C4",
      tbrk: "\u23B4",
      Tcaron: "\u0164",
      tcaron: "\u0165",
      Tcedil: "\u0162",
      tcedil: "\u0163",
      Tcy: "\u0422",
      tcy: "\u0442",
      tdot: "\u20DB",
      telrec: "\u2315",
      Tfr: "\u{1D517}",
      tfr: "\u{1D531}",
      there4: "\u2234",
      Therefore: "\u2234",
      therefore: "\u2234",
      Theta: "\u0398",
      theta: "\u03B8",
      thetasym: "\u03D1",
      thetav: "\u03D1",
      thickapprox: "\u2248",
      thicksim: "\u223C",
      ThickSpace: "\u205F\u200A",
      thinsp: "\u2009",
      ThinSpace: "\u2009",
      thkap: "\u2248",
      thksim: "\u223C",
      THORN: "\xDE",
      thorn: "\xFE",
      Tilde: "\u223C",
      tilde: "\u02DC",
      TildeEqual: "\u2243",
      TildeFullEqual: "\u2245",
      TildeTilde: "\u2248",
      times: "\xD7",
      timesb: "\u22A0",
      timesbar: "\u2A31",
      timesd: "\u2A30",
      tint: "\u222D",
      toea: "\u2928",
      top: "\u22A4",
      topbot: "\u2336",
      topcir: "\u2AF1",
      Topf: "\u{1D54B}",
      topf: "\u{1D565}",
      topfork: "\u2ADA",
      tosa: "\u2929",
      tprime: "\u2034",
      TRADE: "\u2122",
      trade: "\u2122",
      triangle: "\u25B5",
      triangledown: "\u25BF",
      triangleleft: "\u25C3",
      trianglelefteq: "\u22B4",
      triangleq: "\u225C",
      triangleright: "\u25B9",
      trianglerighteq: "\u22B5",
      tridot: "\u25EC",
      trie: "\u225C",
      triminus: "\u2A3A",
      TripleDot: "\u20DB",
      triplus: "\u2A39",
      trisb: "\u29CD",
      tritime: "\u2A3B",
      trpezium: "\u23E2",
      Tscr: "\u{1D4AF}",
      tscr: "\u{1D4C9}",
      TScy: "\u0426",
      tscy: "\u0446",
      TSHcy: "\u040B",
      tshcy: "\u045B",
      Tstrok: "\u0166",
      tstrok: "\u0167",
      twixt: "\u226C",
      twoheadleftarrow: "\u219E",
      twoheadrightarrow: "\u21A0",
      Uacute: "\xDA",
      uacute: "\xFA",
      Uarr: "\u219F",
      uArr: "\u21D1",
      uarr: "\u2191",
      Uarrocir: "\u2949",
      Ubrcy: "\u040E",
      ubrcy: "\u045E",
      Ubreve: "\u016C",
      ubreve: "\u016D",
      Ucirc: "\xDB",
      ucirc: "\xFB",
      Ucy: "\u0423",
      ucy: "\u0443",
      udarr: "\u21C5",
      Udblac: "\u0170",
      udblac: "\u0171",
      udhar: "\u296E",
      ufisht: "\u297E",
      Ufr: "\u{1D518}",
      ufr: "\u{1D532}",
      Ugrave: "\xD9",
      ugrave: "\xF9",
      uHar: "\u2963",
      uharl: "\u21BF",
      uharr: "\u21BE",
      uhblk: "\u2580",
      ulcorn: "\u231C",
      ulcorner: "\u231C",
      ulcrop: "\u230F",
      ultri: "\u25F8",
      Umacr: "\u016A",
      umacr: "\u016B",
      uml: "\xA8",
      UnderBar: "_",
      UnderBrace: "\u23DF",
      UnderBracket: "\u23B5",
      UnderParenthesis: "\u23DD",
      Union: "\u22C3",
      UnionPlus: "\u228E",
      Uogon: "\u0172",
      uogon: "\u0173",
      Uopf: "\u{1D54C}",
      uopf: "\u{1D566}",
      UpArrow: "\u2191",
      Uparrow: "\u21D1",
      uparrow: "\u2191",
      UpArrowBar: "\u2912",
      UpArrowDownArrow: "\u21C5",
      UpDownArrow: "\u2195",
      Updownarrow: "\u21D5",
      updownarrow: "\u2195",
      UpEquilibrium: "\u296E",
      upharpoonleft: "\u21BF",
      upharpoonright: "\u21BE",
      uplus: "\u228E",
      UpperLeftArrow: "\u2196",
      UpperRightArrow: "\u2197",
      Upsi: "\u03D2",
      upsi: "\u03C5",
      upsih: "\u03D2",
      Upsilon: "\u03A5",
      upsilon: "\u03C5",
      UpTee: "\u22A5",
      UpTeeArrow: "\u21A5",
      upuparrows: "\u21C8",
      urcorn: "\u231D",
      urcorner: "\u231D",
      urcrop: "\u230E",
      Uring: "\u016E",
      uring: "\u016F",
      urtri: "\u25F9",
      Uscr: "\u{1D4B0}",
      uscr: "\u{1D4CA}",
      utdot: "\u22F0",
      Utilde: "\u0168",
      utilde: "\u0169",
      utri: "\u25B5",
      utrif: "\u25B4",
      uuarr: "\u21C8",
      Uuml: "\xDC",
      uuml: "\xFC",
      uwangle: "\u29A7",
      vangrt: "\u299C",
      varepsilon: "\u03F5",
      varkappa: "\u03F0",
      varnothing: "\u2205",
      varphi: "\u03D5",
      varpi: "\u03D6",
      varpropto: "\u221D",
      vArr: "\u21D5",
      varr: "\u2195",
      varrho: "\u03F1",
      varsigma: "\u03C2",
      varsubsetneq: "\u228A\uFE00",
      varsubsetneqq: "\u2ACB\uFE00",
      varsupsetneq: "\u228B\uFE00",
      varsupsetneqq: "\u2ACC\uFE00",
      vartheta: "\u03D1",
      vartriangleleft: "\u22B2",
      vartriangleright: "\u22B3",
      Vbar: "\u2AEB",
      vBar: "\u2AE8",
      vBarv: "\u2AE9",
      Vcy: "\u0412",
      vcy: "\u0432",
      VDash: "\u22AB",
      Vdash: "\u22A9",
      vDash: "\u22A8",
      vdash: "\u22A2",
      Vdashl: "\u2AE6",
      Vee: "\u22C1",
      vee: "\u2228",
      veebar: "\u22BB",
      veeeq: "\u225A",
      vellip: "\u22EE",
      Verbar: "\u2016",
      verbar: "|",
      Vert: "\u2016",
      vert: "|",
      VerticalBar: "\u2223",
      VerticalLine: "|",
      VerticalSeparator: "\u2758",
      VerticalTilde: "\u2240",
      VeryThinSpace: "\u200A",
      Vfr: "\u{1D519}",
      vfr: "\u{1D533}",
      vltri: "\u22B2",
      vnsub: "\u2282\u20D2",
      vnsup: "\u2283\u20D2",
      Vopf: "\u{1D54D}",
      vopf: "\u{1D567}",
      vprop: "\u221D",
      vrtri: "\u22B3",
      Vscr: "\u{1D4B1}",
      vscr: "\u{1D4CB}",
      vsubnE: "\u2ACB\uFE00",
      vsubne: "\u228A\uFE00",
      vsupnE: "\u2ACC\uFE00",
      vsupne: "\u228B\uFE00",
      Vvdash: "\u22AA",
      vzigzag: "\u299A",
      Wcirc: "\u0174",
      wcirc: "\u0175",
      wedbar: "\u2A5F",
      Wedge: "\u22C0",
      wedge: "\u2227",
      wedgeq: "\u2259",
      weierp: "\u2118",
      Wfr: "\u{1D51A}",
      wfr: "\u{1D534}",
      Wopf: "\u{1D54E}",
      wopf: "\u{1D568}",
      wp: "\u2118",
      wr: "\u2240",
      wreath: "\u2240",
      Wscr: "\u{1D4B2}",
      wscr: "\u{1D4CC}",
      xcap: "\u22C2",
      xcirc: "\u25EF",
      xcup: "\u22C3",
      xdtri: "\u25BD",
      Xfr: "\u{1D51B}",
      xfr: "\u{1D535}",
      xhArr: "\u27FA",
      xharr: "\u27F7",
      Xi: "\u039E",
      xi: "\u03BE",
      xlArr: "\u27F8",
      xlarr: "\u27F5",
      xmap: "\u27FC",
      xnis: "\u22FB",
      xodot: "\u2A00",
      Xopf: "\u{1D54F}",
      xopf: "\u{1D569}",
      xoplus: "\u2A01",
      xotime: "\u2A02",
      xrArr: "\u27F9",
      xrarr: "\u27F6",
      Xscr: "\u{1D4B3}",
      xscr: "\u{1D4CD}",
      xsqcup: "\u2A06",
      xuplus: "\u2A04",
      xutri: "\u25B3",
      xvee: "\u22C1",
      xwedge: "\u22C0",
      Yacute: "\xDD",
      yacute: "\xFD",
      YAcy: "\u042F",
      yacy: "\u044F",
      Ycirc: "\u0176",
      ycirc: "\u0177",
      Ycy: "\u042B",
      ycy: "\u044B",
      yen: "\xA5",
      Yfr: "\u{1D51C}",
      yfr: "\u{1D536}",
      YIcy: "\u0407",
      yicy: "\u0457",
      Yopf: "\u{1D550}",
      yopf: "\u{1D56A}",
      Yscr: "\u{1D4B4}",
      yscr: "\u{1D4CE}",
      YUcy: "\u042E",
      yucy: "\u044E",
      Yuml: "\u0178",
      yuml: "\xFF",
      Zacute: "\u0179",
      zacute: "\u017A",
      Zcaron: "\u017D",
      zcaron: "\u017E",
      Zcy: "\u0417",
      zcy: "\u0437",
      Zdot: "\u017B",
      zdot: "\u017C",
      zeetrf: "\u2128",
      ZeroWidthSpace: "\u200B",
      Zeta: "\u0396",
      zeta: "\u03B6",
      Zfr: "\u2128",
      zfr: "\u{1D537}",
      ZHcy: "\u0416",
      zhcy: "\u0436",
      zigrarr: "\u21DD",
      Zopf: "\u2124",
      zopf: "\u{1D56B}",
      Zscr: "\u{1D4B5}",
      zscr: "\u{1D4CF}",
      zwj: "\u200D",
      zwnj: "\u200C"
    });
    exports.entityMap = exports.HTML_ENTITIES;
  }
});

// ../../node_modules/@xmldom/xmldom/lib/sax.js
var require_sax = __commonJS({
  "../../node_modules/@xmldom/xmldom/lib/sax.js"(exports) {
    "use strict";
    var NAMESPACE = require_conventions().NAMESPACE;
    var nameStartChar = /[A-Z_a-z\xC0-\xD6\xD8-\xF6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/;
    var nameChar = new RegExp("[\\-\\.0-9" + nameStartChar.source.slice(1, -1) + "\\u00B7\\u0300-\\u036F\\u203F-\\u2040]");
    var tagNamePattern = new RegExp("^" + nameStartChar.source + nameChar.source + "*(?::" + nameStartChar.source + nameChar.source + "*)?$");
    var S_TAG = 0;
    var S_ATTR = 1;
    var S_ATTR_SPACE = 2;
    var S_EQ = 3;
    var S_ATTR_NOQUOT_VALUE = 4;
    var S_ATTR_END = 5;
    var S_TAG_SPACE = 6;
    var S_TAG_CLOSE = 7;
    function ParseError(message, locator) {
      this.message = message;
      this.locator = locator;
      if (Error.captureStackTrace) Error.captureStackTrace(this, ParseError);
    }
    ParseError.prototype = new Error();
    ParseError.prototype.name = ParseError.name;
    function XMLReader() {
    }
    XMLReader.prototype = {
      parse: function(source, defaultNSMap, entityMap) {
        var domBuilder = this.domBuilder;
        domBuilder.startDocument();
        _copy(defaultNSMap, defaultNSMap = {});
        parse(
          source,
          defaultNSMap,
          entityMap,
          domBuilder,
          this.errorHandler
        );
        domBuilder.endDocument();
      }
    };
    function parse(source, defaultNSMapCopy, entityMap, domBuilder, errorHandler) {
      function fixedFromCharCode(code) {
        if (code > 65535) {
          code -= 65536;
          var surrogate1 = 55296 + (code >> 10), surrogate2 = 56320 + (code & 1023);
          return String.fromCharCode(surrogate1, surrogate2);
        } else {
          return String.fromCharCode(code);
        }
      }
      function entityReplacer(a2) {
        var k = a2.slice(1, -1);
        if (k in entityMap) {
          return entityMap[k];
        } else if (k.charAt(0) === "#") {
          return fixedFromCharCode(parseInt(k.substr(1).replace("x", "0x")));
        } else {
          errorHandler.error("entity not found:" + a2);
          return a2;
        }
      }
      function appendText(end2) {
        if (end2 > start) {
          var xt = source.substring(start, end2).replace(/&#?\w+;/g, entityReplacer);
          locator && position(start);
          domBuilder.characters(xt, 0, end2 - start);
          start = end2;
        }
      }
      function position(p, m) {
        while (p >= lineEnd && (m = linePattern.exec(source))) {
          lineStart = m.index;
          lineEnd = lineStart + m[0].length;
          locator.lineNumber++;
        }
        locator.columnNumber = p - lineStart + 1;
      }
      var lineStart = 0;
      var lineEnd = 0;
      var linePattern = /.*(?:\r\n?|\n)|.*$/g;
      var locator = domBuilder.locator;
      var parseStack = [{ currentNSMap: defaultNSMapCopy }];
      var closeMap = {};
      var start = 0;
      while (true) {
        try {
          var tagStart = source.indexOf("<", start);
          if (tagStart < 0) {
            if (!source.substr(start).match(/^\s*$/)) {
              var doc = domBuilder.doc;
              var text = doc.createTextNode(source.substr(start));
              doc.appendChild(text);
              domBuilder.currentElement = text;
            }
            return;
          }
          if (tagStart > start) {
            appendText(tagStart);
          }
          switch (source.charAt(tagStart + 1)) {
            case "/":
              var end = source.indexOf(">", tagStart + 3);
              var tagName = source.substring(tagStart + 2, end).replace(/[ \t\n\r]+$/g, "");
              var config = parseStack.pop();
              if (end < 0) {
                tagName = source.substring(tagStart + 2).replace(/[\s<].*/, "");
                errorHandler.error("end tag name: " + tagName + " is not complete:" + config.tagName);
                end = tagStart + 1 + tagName.length;
              } else if (tagName.match(/\s</)) {
                tagName = tagName.replace(/[\s<].*/, "");
                errorHandler.error("end tag name: " + tagName + " maybe not complete");
                end = tagStart + 1 + tagName.length;
              }
              var localNSMap = config.localNSMap;
              var endMatch = config.tagName == tagName;
              var endIgnoreCaseMach = endMatch || config.tagName && config.tagName.toLowerCase() == tagName.toLowerCase();
              if (endIgnoreCaseMach) {
                domBuilder.endElement(config.uri, config.localName, tagName);
                if (localNSMap) {
                  for (var prefix in localNSMap) {
                    if (Object.prototype.hasOwnProperty.call(localNSMap, prefix)) {
                      domBuilder.endPrefixMapping(prefix);
                    }
                  }
                }
                if (!endMatch) {
                  errorHandler.fatalError("end tag name: " + tagName + " is not match the current start tagName:" + config.tagName);
                }
              } else {
                parseStack.push(config);
              }
              end++;
              break;
            // end elment
            case "?":
              locator && position(tagStart);
              end = parseInstruction(source, tagStart, domBuilder);
              break;
            case "!":
              locator && position(tagStart);
              end = parseDCC(source, tagStart, domBuilder, errorHandler);
              break;
            default:
              locator && position(tagStart);
              var el = new ElementAttributes();
              var currentNSMap = parseStack[parseStack.length - 1].currentNSMap;
              var end = parseElementStartPart(source, tagStart, el, currentNSMap, entityReplacer, errorHandler);
              var len = el.length;
              if (!el.closed && fixSelfClosed(source, end, el.tagName, closeMap)) {
                el.closed = true;
                if (!entityMap.nbsp) {
                  errorHandler.warning("unclosed xml attribute");
                }
              }
              if (locator && len) {
                var locator2 = copyLocator(locator, {});
                for (var i = 0; i < len; i++) {
                  var a = el[i];
                  position(a.offset);
                  a.locator = copyLocator(locator, {});
                }
                domBuilder.locator = locator2;
                if (appendElement(el, domBuilder, currentNSMap)) {
                  parseStack.push(el);
                }
                domBuilder.locator = locator;
              } else {
                if (appendElement(el, domBuilder, currentNSMap)) {
                  parseStack.push(el);
                }
              }
              if (NAMESPACE.isHTML(el.uri) && !el.closed) {
                end = parseHtmlSpecialContent(source, end, el.tagName, entityReplacer, domBuilder);
              } else {
                end++;
              }
          }
        } catch (e) {
          if (e instanceof ParseError) {
            throw e;
          }
          errorHandler.error("element parse error: " + e);
          end = -1;
        }
        if (end > start) {
          start = end;
        } else {
          appendText(Math.max(tagStart, start) + 1);
        }
      }
    }
    function copyLocator(f, t) {
      t.lineNumber = f.lineNumber;
      t.columnNumber = f.columnNumber;
      return t;
    }
    function parseElementStartPart(source, start, el, currentNSMap, entityReplacer, errorHandler) {
      function addAttribute(qname, value2, startIndex) {
        if (el.attributeNames.hasOwnProperty(qname)) {
          errorHandler.fatalError("Attribute " + qname + " redefined");
        }
        el.addValue(qname, value2, startIndex);
      }
      var attrName;
      var value;
      var p = ++start;
      var s = S_TAG;
      while (true) {
        var c = source.charAt(p);
        switch (c) {
          case "=":
            if (s === S_ATTR) {
              attrName = source.slice(start, p);
              s = S_EQ;
            } else if (s === S_ATTR_SPACE) {
              s = S_EQ;
            } else {
              throw new Error("attribute equal must after attrName");
            }
            break;
          case "'":
          case '"':
            if (s === S_EQ || s === S_ATTR) {
              if (s === S_ATTR) {
                errorHandler.warning('attribute value must after "="');
                attrName = source.slice(start, p);
              }
              start = p + 1;
              p = source.indexOf(c, start);
              if (p > 0) {
                value = source.slice(start, p).replace(/&#?\w+;/g, entityReplacer);
                addAttribute(attrName, value, start - 1);
                s = S_ATTR_END;
              } else {
                throw new Error("attribute value no end '" + c + "' match");
              }
            } else if (s == S_ATTR_NOQUOT_VALUE) {
              value = source.slice(start, p).replace(/&#?\w+;/g, entityReplacer);
              addAttribute(attrName, value, start);
              errorHandler.warning('attribute "' + attrName + '" missed start quot(' + c + ")!!");
              start = p + 1;
              s = S_ATTR_END;
            } else {
              throw new Error('attribute value must after "="');
            }
            break;
          case "/":
            switch (s) {
              case S_TAG:
                el.setTagName(source.slice(start, p));
              case S_ATTR_END:
              case S_TAG_SPACE:
              case S_TAG_CLOSE:
                s = S_TAG_CLOSE;
                el.closed = true;
              case S_ATTR_NOQUOT_VALUE:
              case S_ATTR:
                break;
              case S_ATTR_SPACE:
                el.closed = true;
                break;
              //case S_EQ:
              default:
                throw new Error("attribute invalid close char('/')");
            }
            break;
          case "":
            errorHandler.error("unexpected end of input");
            if (s == S_TAG) {
              el.setTagName(source.slice(start, p));
            }
            return p;
          case ">":
            switch (s) {
              case S_TAG:
                el.setTagName(source.slice(start, p));
              case S_ATTR_END:
              case S_TAG_SPACE:
              case S_TAG_CLOSE:
                break;
              //normal
              case S_ATTR_NOQUOT_VALUE:
              //Compatible state
              case S_ATTR:
                value = source.slice(start, p);
                if (value.slice(-1) === "/") {
                  el.closed = true;
                  value = value.slice(0, -1);
                }
              case S_ATTR_SPACE:
                if (s === S_ATTR_SPACE) {
                  value = attrName;
                }
                if (s == S_ATTR_NOQUOT_VALUE) {
                  errorHandler.warning('attribute "' + value + '" missed quot(")!');
                  addAttribute(attrName, value.replace(/&#?\w+;/g, entityReplacer), start);
                } else {
                  if (!NAMESPACE.isHTML(currentNSMap[""]) || !value.match(/^(?:disabled|checked|selected)$/i)) {
                    errorHandler.warning('attribute "' + value + '" missed value!! "' + value + '" instead!!');
                  }
                  addAttribute(value, value, start);
                }
                break;
              case S_EQ:
                throw new Error("attribute value missed!!");
            }
            return p;
          /*xml space '\x20' | #x9 | #xD | #xA; */
          case "\x80":
            c = " ";
          default:
            if (c <= " ") {
              switch (s) {
                case S_TAG:
                  el.setTagName(source.slice(start, p));
                  s = S_TAG_SPACE;
                  break;
                case S_ATTR:
                  attrName = source.slice(start, p);
                  s = S_ATTR_SPACE;
                  break;
                case S_ATTR_NOQUOT_VALUE:
                  var value = source.slice(start, p).replace(/&#?\w+;/g, entityReplacer);
                  errorHandler.warning('attribute "' + value + '" missed quot(")!!');
                  addAttribute(attrName, value, start);
                case S_ATTR_END:
                  s = S_TAG_SPACE;
                  break;
              }
            } else {
              switch (s) {
                //case S_TAG:void();break;
                //case S_ATTR:void();break;
                //case S_ATTR_NOQUOT_VALUE:void();break;
                case S_ATTR_SPACE:
                  var tagName = el.tagName;
                  if (!NAMESPACE.isHTML(currentNSMap[""]) || !attrName.match(/^(?:disabled|checked|selected)$/i)) {
                    errorHandler.warning('attribute "' + attrName + '" missed value!! "' + attrName + '" instead2!!');
                  }
                  addAttribute(attrName, attrName, start);
                  start = p;
                  s = S_ATTR;
                  break;
                case S_ATTR_END:
                  errorHandler.warning('attribute space is required"' + attrName + '"!!');
                case S_TAG_SPACE:
                  s = S_ATTR;
                  start = p;
                  break;
                case S_EQ:
                  s = S_ATTR_NOQUOT_VALUE;
                  start = p;
                  break;
                case S_TAG_CLOSE:
                  throw new Error("elements closed character '/' and '>' must be connected to");
              }
            }
        }
        p++;
      }
    }
    function appendElement(el, domBuilder, currentNSMap) {
      var tagName = el.tagName;
      var localNSMap = null;
      var i = el.length;
      while (i--) {
        var a = el[i];
        var qName = a.qName;
        var value = a.value;
        var nsp = qName.indexOf(":");
        if (nsp > 0) {
          var prefix = a.prefix = qName.slice(0, nsp);
          var localName = qName.slice(nsp + 1);
          var nsPrefix = prefix === "xmlns" && localName;
        } else {
          localName = qName;
          prefix = null;
          nsPrefix = qName === "xmlns" && "";
        }
        a.localName = localName;
        if (nsPrefix !== false) {
          if (localNSMap == null) {
            localNSMap = {};
            _copy(currentNSMap, currentNSMap = {});
          }
          currentNSMap[nsPrefix] = localNSMap[nsPrefix] = value;
          a.uri = NAMESPACE.XMLNS;
          domBuilder.startPrefixMapping(nsPrefix, value);
        }
      }
      var i = el.length;
      while (i--) {
        a = el[i];
        var prefix = a.prefix;
        if (prefix) {
          if (prefix === "xml") {
            a.uri = NAMESPACE.XML;
          }
          if (prefix !== "xmlns") {
            a.uri = currentNSMap[prefix || ""];
          }
        }
      }
      var nsp = tagName.indexOf(":");
      if (nsp > 0) {
        prefix = el.prefix = tagName.slice(0, nsp);
        localName = el.localName = tagName.slice(nsp + 1);
      } else {
        prefix = null;
        localName = el.localName = tagName;
      }
      var ns = el.uri = currentNSMap[prefix || ""];
      domBuilder.startElement(ns, localName, tagName, el);
      if (el.closed) {
        domBuilder.endElement(ns, localName, tagName);
        if (localNSMap) {
          for (prefix in localNSMap) {
            if (Object.prototype.hasOwnProperty.call(localNSMap, prefix)) {
              domBuilder.endPrefixMapping(prefix);
            }
          }
        }
      } else {
        el.currentNSMap = currentNSMap;
        el.localNSMap = localNSMap;
        return true;
      }
    }
    function parseHtmlSpecialContent(source, elStartEnd, tagName, entityReplacer, domBuilder) {
      if (/^(?:script|textarea)$/i.test(tagName)) {
        var elEndStart = source.indexOf("</" + tagName + ">", elStartEnd);
        var text = source.substring(elStartEnd + 1, elEndStart);
        if (/[&<]/.test(text)) {
          if (/^script$/i.test(tagName)) {
            domBuilder.characters(text, 0, text.length);
            return elEndStart;
          }
          text = text.replace(/&#?\w+;/g, entityReplacer);
          domBuilder.characters(text, 0, text.length);
          return elEndStart;
        }
      }
      return elStartEnd + 1;
    }
    function fixSelfClosed(source, elStartEnd, tagName, closeMap) {
      var pos = closeMap[tagName];
      if (pos == null) {
        pos = source.lastIndexOf("</" + tagName + ">");
        if (pos < elStartEnd) {
          pos = source.lastIndexOf("</" + tagName);
        }
        closeMap[tagName] = pos;
      }
      return pos < elStartEnd;
    }
    function _copy(source, target) {
      for (var n in source) {
        if (Object.prototype.hasOwnProperty.call(source, n)) {
          target[n] = source[n];
        }
      }
    }
    function parseDCC(source, start, domBuilder, errorHandler) {
      var next = source.charAt(start + 2);
      switch (next) {
        case "-":
          if (source.charAt(start + 3) === "-") {
            var end = source.indexOf("-->", start + 4);
            if (end > start) {
              domBuilder.comment(source, start + 4, end - start - 4);
              return end + 3;
            } else {
              errorHandler.error("Unclosed comment");
              return -1;
            }
          } else {
            return -1;
          }
        default:
          if (source.substr(start + 3, 6) == "CDATA[") {
            var end = source.indexOf("]]>", start + 9);
            domBuilder.startCDATA();
            domBuilder.characters(source, start + 9, end - start - 9);
            domBuilder.endCDATA();
            return end + 3;
          }
          var matchs = split2(source, start);
          var len = matchs.length;
          if (len > 1 && /!doctype/i.test(matchs[0][0])) {
            var name2 = matchs[1][0];
            var pubid = false;
            var sysid = false;
            if (len > 3) {
              if (/^public$/i.test(matchs[2][0])) {
                pubid = matchs[3][0];
                sysid = len > 4 && matchs[4][0];
              } else if (/^system$/i.test(matchs[2][0])) {
                sysid = matchs[3][0];
              }
            }
            var lastMatch = matchs[len - 1];
            domBuilder.startDTD(name2, pubid, sysid);
            domBuilder.endDTD();
            return lastMatch.index + lastMatch[0].length;
          }
      }
      return -1;
    }
    function parseInstruction(source, start, domBuilder) {
      var end = source.indexOf("?>", start);
      if (end) {
        var match = source.substring(start, end).match(/^<\?(\S*)\s*([\s\S]*?)\s*$/);
        if (match) {
          var len = match[0].length;
          domBuilder.processingInstruction(match[1], match[2]);
          return end + 2;
        } else {
          return -1;
        }
      }
      return -1;
    }
    function ElementAttributes() {
      this.attributeNames = {};
    }
    ElementAttributes.prototype = {
      setTagName: function(tagName) {
        if (!tagNamePattern.test(tagName)) {
          throw new Error("invalid tagName:" + tagName);
        }
        this.tagName = tagName;
      },
      addValue: function(qName, value, offset) {
        if (!tagNamePattern.test(qName)) {
          throw new Error("invalid attribute:" + qName);
        }
        this.attributeNames[qName] = this.length;
        this[this.length++] = { qName, value, offset };
      },
      length: 0,
      getLocalName: function(i) {
        return this[i].localName;
      },
      getLocator: function(i) {
        return this[i].locator;
      },
      getQName: function(i) {
        return this[i].qName;
      },
      getURI: function(i) {
        return this[i].uri;
      },
      getValue: function(i) {
        return this[i].value;
      }
      //	,getIndex:function(uri, localName)){
      //		if(localName){
      //
      //		}else{
      //			var qName = uri
      //		}
      //	},
      //	getValue:function(){return this.getValue(this.getIndex.apply(this,arguments))},
      //	getType:function(uri,localName){}
      //	getType:function(i){},
    };
    function split2(source, start) {
      var match;
      var buf = [];
      var reg = /'[^']+'|"[^"]+"|[^\s<>\/=]+=?|(\/?\s*>|<)/g;
      reg.lastIndex = start;
      reg.exec(source);
      while (match = reg.exec(source)) {
        buf.push(match);
        if (match[1]) return buf;
      }
    }
    exports.XMLReader = XMLReader;
    exports.ParseError = ParseError;
  }
});

// ../../node_modules/@xmldom/xmldom/lib/dom-parser.js
var require_dom_parser = __commonJS({
  "../../node_modules/@xmldom/xmldom/lib/dom-parser.js"(exports) {
    "use strict";
    var conventions = require_conventions();
    var dom = require_dom();
    var entities = require_entities();
    var sax = require_sax();
    var DOMImplementation = dom.DOMImplementation;
    var NAMESPACE = conventions.NAMESPACE;
    var ParseError = sax.ParseError;
    var XMLReader = sax.XMLReader;
    function DOMParser(options) {
      this.options = options || { locator: {} };
    }
    DOMParser.prototype.parseFromString = function(source, mimeType) {
      var options = this.options;
      var sax2 = new XMLReader();
      var domBuilder = options.domBuilder || new DOMHandler();
      var errorHandler = options.errorHandler;
      var locator = options.locator;
      var defaultNSMap = options.xmlns || {};
      var isHTML = /\/x?html?$/.test(mimeType);
      var entityMap = isHTML ? entities.HTML_ENTITIES : entities.XML_ENTITIES;
      if (locator) {
        domBuilder.setDocumentLocator(locator);
      }
      sax2.errorHandler = buildErrorHandler(errorHandler, domBuilder, locator);
      sax2.domBuilder = options.domBuilder || domBuilder;
      if (isHTML) {
        defaultNSMap[""] = NAMESPACE.HTML;
      }
      defaultNSMap.xml = defaultNSMap.xml || NAMESPACE.XML;
      if (source && typeof source === "string") {
        sax2.parse(source, defaultNSMap, entityMap);
      } else {
        sax2.errorHandler.error("invalid doc source");
      }
      return domBuilder.doc;
    };
    function buildErrorHandler(errorImpl, domBuilder, locator) {
      if (!errorImpl) {
        if (domBuilder instanceof DOMHandler) {
          return domBuilder;
        }
        errorImpl = domBuilder;
      }
      var errorHandler = {};
      var isCallback = errorImpl instanceof Function;
      locator = locator || {};
      function build(key) {
        var fn = errorImpl[key];
        if (!fn && isCallback) {
          fn = errorImpl.length == 2 ? function(msg) {
            errorImpl(key, msg);
          } : errorImpl;
        }
        errorHandler[key] = fn && function(msg) {
          fn("[xmldom " + key + "]	" + msg + _locator(locator));
        } || function() {
        };
      }
      build("warning");
      build("error");
      build("fatalError");
      return errorHandler;
    }
    function DOMHandler() {
      this.cdata = false;
    }
    function position(locator, node) {
      node.lineNumber = locator.lineNumber;
      node.columnNumber = locator.columnNumber;
    }
    DOMHandler.prototype = {
      startDocument: function() {
        this.doc = new DOMImplementation().createDocument(null, null, null);
        if (this.locator) {
          this.doc.documentURI = this.locator.systemId;
        }
      },
      startElement: function(namespaceURI, localName, qName, attrs) {
        var doc = this.doc;
        var el = doc.createElementNS(namespaceURI, qName || localName);
        var len = attrs.length;
        appendElement(this, el);
        this.currentElement = el;
        this.locator && position(this.locator, el);
        for (var i = 0; i < len; i++) {
          var namespaceURI = attrs.getURI(i);
          var value = attrs.getValue(i);
          var qName = attrs.getQName(i);
          var attr = doc.createAttributeNS(namespaceURI, qName);
          this.locator && position(attrs.getLocator(i), attr);
          attr.value = attr.nodeValue = value;
          el.setAttributeNode(attr);
        }
      },
      endElement: function(namespaceURI, localName, qName) {
        var current = this.currentElement;
        var tagName = current.tagName;
        this.currentElement = current.parentNode;
      },
      startPrefixMapping: function(prefix, uri) {
      },
      endPrefixMapping: function(prefix) {
      },
      processingInstruction: function(target, data2) {
        var ins = this.doc.createProcessingInstruction(target, data2);
        this.locator && position(this.locator, ins);
        appendElement(this, ins);
      },
      ignorableWhitespace: function(ch, start, length) {
      },
      characters: function(chars, start, length) {
        chars = _toString.apply(this, arguments);
        if (chars) {
          if (this.cdata) {
            var charNode = this.doc.createCDATASection(chars);
          } else {
            var charNode = this.doc.createTextNode(chars);
          }
          if (this.currentElement) {
            this.currentElement.appendChild(charNode);
          } else if (/^\s*$/.test(chars)) {
            this.doc.appendChild(charNode);
          }
          this.locator && position(this.locator, charNode);
        }
      },
      skippedEntity: function(name2) {
      },
      endDocument: function() {
        this.doc.normalize();
      },
      setDocumentLocator: function(locator) {
        if (this.locator = locator) {
          locator.lineNumber = 0;
        }
      },
      //LexicalHandler
      comment: function(chars, start, length) {
        chars = _toString.apply(this, arguments);
        var comm = this.doc.createComment(chars);
        this.locator && position(this.locator, comm);
        appendElement(this, comm);
      },
      startCDATA: function() {
        this.cdata = true;
      },
      endCDATA: function() {
        this.cdata = false;
      },
      startDTD: function(name2, publicId, systemId) {
        var impl2 = this.doc.implementation;
        if (impl2 && impl2.createDocumentType) {
          var dt = impl2.createDocumentType(name2, publicId, systemId);
          this.locator && position(this.locator, dt);
          appendElement(this, dt);
          this.doc.doctype = dt;
        }
      },
      /**
       * @see org.xml.sax.ErrorHandler
       * @link http://www.saxproject.org/apidoc/org/xml/sax/ErrorHandler.html
       */
      warning: function(error2) {
        console.warn("[xmldom warning]	" + error2, _locator(this.locator));
      },
      error: function(error2) {
        console.error("[xmldom error]	" + error2, _locator(this.locator));
      },
      fatalError: function(error2) {
        throw new ParseError(error2, this.locator);
      }
    };
    function _locator(l) {
      if (l) {
        return "\n@" + (l.systemId || "") + "#[line:" + l.lineNumber + ",col:" + l.columnNumber + "]";
      }
    }
    function _toString(chars, start, length) {
      if (typeof chars == "string") {
        return chars.substr(start, length);
      } else {
        if (chars.length >= start + length || start) {
          return new java.lang.String(chars, start, length) + "";
        }
        return chars;
      }
    }
    "endDTD,startEntity,endEntity,attributeDecl,elementDecl,externalEntityDecl,internalEntityDecl,resolveEntity,getExternalSubset,notationDecl,unparsedEntityDecl".replace(/\w+/g, function(key) {
      DOMHandler.prototype[key] = function() {
        return null;
      };
    });
    function appendElement(hander, node) {
      if (!hander.currentElement) {
        hander.doc.appendChild(node);
      } else {
        hander.currentElement.appendChild(node);
      }
    }
    exports.__DOMHandler = DOMHandler;
    exports.DOMParser = DOMParser;
    exports.DOMImplementation = dom.DOMImplementation;
    exports.XMLSerializer = dom.XMLSerializer;
  }
});

// ../../node_modules/@xmldom/xmldom/lib/index.js
var require_lib = __commonJS({
  "../../node_modules/@xmldom/xmldom/lib/index.js"(exports) {
    "use strict";
    var dom = require_dom();
    exports.DOMImplementation = dom.DOMImplementation;
    exports.XMLSerializer = dom.XMLSerializer;
    exports.DOMParser = require_dom_parser().DOMParser;
  }
});

// ../../node_modules/kdbxweb/dist/kdbxweb.js
var require_kdbxweb = __commonJS({
  "../../node_modules/kdbxweb/dist/kdbxweb.js"(exports, module) {
    "use strict";
    (function webpackUniversalModuleDefinition(root, factory) {
      if (typeof exports === "object" && typeof module === "object")
        module.exports = factory(__require("crypto"), require_lib());
      else if (typeof define === "function" && define.amd)
        define(["crypto", "@xmldom/xmldom"], factory);
      else if (typeof exports === "object")
        exports["kdbxweb"] = factory(__require("crypto"), require_lib());
      else
        root["kdbxweb"] = factory(root["crypto"], root["@xmldom/xmldom"]);
    })(exports, function(__WEBPACK_EXTERNAL_MODULE_crypto__, __WEBPACK_EXTERNAL_MODULE__xmldom_xmldom__) {
      return (
        /******/
        (() => {
          "use strict";
          var __webpack_modules__ = {
            /***/
            "./crypto/chacha20.ts": (
              /*!****************************!*\
                !*** ./crypto/chacha20.ts ***!
                \****************************/
              /***/
              ((__unused_webpack_module, exports2) => {
                Object.defineProperty(exports2, "__esModule", { value: true });
                exports2.ChaCha20 = void 0;
                class ChaCha20 {
                  constructor(key, nonce) {
                    this._sigmaWords = [1634760805, 857760878, 2036477234, 1797285236];
                    this._block = new Uint8Array(64);
                    this._blockUsed = 64;
                    this._x = new Uint32Array(16);
                    const input = new Uint32Array(16);
                    input[0] = this._sigmaWords[0];
                    input[1] = this._sigmaWords[1];
                    input[2] = this._sigmaWords[2];
                    input[3] = this._sigmaWords[3];
                    input[4] = u8to32le(key, 0);
                    input[5] = u8to32le(key, 4);
                    input[6] = u8to32le(key, 8);
                    input[7] = u8to32le(key, 12);
                    input[8] = u8to32le(key, 16);
                    input[9] = u8to32le(key, 20);
                    input[10] = u8to32le(key, 24);
                    input[11] = u8to32le(key, 28);
                    input[12] = 0;
                    if (nonce.length === 12) {
                      input[13] = u8to32le(nonce, 0);
                      input[14] = u8to32le(nonce, 4);
                      input[15] = u8to32le(nonce, 8);
                    } else {
                      input[13] = 0;
                      input[14] = u8to32le(nonce, 0);
                      input[15] = u8to32le(nonce, 4);
                    }
                    this._input = input;
                  }
                  getBytes(numberOfBytes) {
                    const out = new Uint8Array(numberOfBytes);
                    for (let i = 0; i < numberOfBytes; i++) {
                      if (this._blockUsed === 64) {
                        this.generateBlock();
                        this._blockUsed = 0;
                      }
                      out[i] = this._block[this._blockUsed];
                      this._blockUsed++;
                    }
                    return out;
                  }
                  generateBlock() {
                    const input = this._input;
                    const x = this._x;
                    const block = this._block;
                    x.set(input);
                    for (let i = 20; i > 0; i -= 2) {
                      quarterRound(x, 0, 4, 8, 12);
                      quarterRound(x, 1, 5, 9, 13);
                      quarterRound(x, 2, 6, 10, 14);
                      quarterRound(x, 3, 7, 11, 15);
                      quarterRound(x, 0, 5, 10, 15);
                      quarterRound(x, 1, 6, 11, 12);
                      quarterRound(x, 2, 7, 8, 13);
                      quarterRound(x, 3, 4, 9, 14);
                    }
                    for (let i = 16; i--; ) {
                      x[i] += input[i];
                    }
                    for (let i = 16; i--; ) {
                      u32to8le(block, 4 * i, x[i]);
                    }
                    input[12] += 1;
                    if (!input[12]) {
                      input[13] += 1;
                    }
                  }
                  encrypt(data2) {
                    const length = data2.length;
                    const res = new Uint8Array(length);
                    let pos = 0;
                    const block = this._block;
                    while (pos < length) {
                      this.generateBlock();
                      const blockLength = Math.min(length - pos, 64);
                      for (let i = 0; i < blockLength; i++) {
                        res[pos] = data2[pos] ^ block[i];
                        pos++;
                      }
                    }
                    return res;
                  }
                }
                exports2.ChaCha20 = ChaCha20;
                function quarterRound(x, a, b, c, d) {
                  x[a] += x[b];
                  x[d] = rotate(x[d] ^ x[a], 16);
                  x[c] += x[d];
                  x[b] = rotate(x[b] ^ x[c], 12);
                  x[a] += x[b];
                  x[d] = rotate(x[d] ^ x[a], 8);
                  x[c] += x[d];
                  x[b] = rotate(x[b] ^ x[c], 7);
                }
                function u8to32le(x, i) {
                  return x[i] | x[i + 1] << 8 | x[i + 2] << 16 | x[i + 3] << 24;
                }
                function u32to8le(x, i, u) {
                  x[i] = u;
                  u >>>= 8;
                  x[i + 1] = u;
                  u >>>= 8;
                  x[i + 2] = u;
                  u >>>= 8;
                  x[i + 3] = u;
                }
                function rotate(v, c) {
                  return v << c | v >>> 32 - c;
                }
              })
            ),
            /***/
            "./crypto/crypto-engine.ts": (
              /*!*********************************!*\
                !*** ./crypto/crypto-engine.ts ***!
                \*********************************/
              /***/
              ((__unused_webpack_module, exports2, __webpack_require__2) => {
                Object.defineProperty(exports2, "__esModule", { value: true });
                exports2.setArgon2Impl = exports2.argon2 = exports2.Argon2TypeArgon2id = exports2.Argon2TypeArgon2d = exports2.chacha20 = exports2.random = exports2.createAesCbc = exports2.AesCbc = exports2.hmacSha256 = exports2.sha512 = exports2.sha256 = void 0;
                const kdbx_error_1 = __webpack_require__2(
                  /*! ../errors/kdbx-error */
                  "./errors/kdbx-error.ts"
                );
                const consts_1 = __webpack_require__2(
                  /*! ../defs/consts */
                  "./defs/consts.ts"
                );
                const byte_utils_1 = __webpack_require__2(
                  /*! ../utils/byte-utils */
                  "./utils/byte-utils.ts"
                );
                const chacha20_1 = __webpack_require__2(
                  /*! ./chacha20 */
                  "./crypto/chacha20.ts"
                );
                const nodeCrypto = __webpack_require__2(
                  /*! crypto */
                  "crypto"
                );
                const EmptySha256 = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
                const EmptySha512 = "cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e";
                const MaxRandomQuota = 65536;
                function sha2564(data2) {
                  var _a2;
                  if (!data2.byteLength) {
                    return Promise.resolve((0, byte_utils_1.arrayToBuffer)((0, byte_utils_1.hexToBytes)(EmptySha256)));
                  }
                  if ((_a2 = __webpack_require__2.g.crypto) === null || _a2 === void 0 ? void 0 : _a2.subtle) {
                    return __webpack_require__2.g.crypto.subtle.digest({ name: "SHA-256" }, data2);
                  } else {
                    return new Promise((resolve) => {
                      const sha = nodeCrypto.createHash("sha256");
                      const hash2 = sha.update(Buffer.from(data2)).digest();
                      resolve(hash2.buffer);
                    });
                  }
                }
                exports2.sha256 = sha2564;
                function sha5123(data2) {
                  var _a2;
                  if (!data2.byteLength) {
                    return Promise.resolve((0, byte_utils_1.arrayToBuffer)((0, byte_utils_1.hexToBytes)(EmptySha512)));
                  }
                  if ((_a2 = __webpack_require__2.g.crypto) === null || _a2 === void 0 ? void 0 : _a2.subtle) {
                    return __webpack_require__2.g.crypto.subtle.digest({ name: "SHA-512" }, data2);
                  } else {
                    return new Promise((resolve) => {
                      const sha = nodeCrypto.createHash("sha512");
                      const hash2 = sha.update(Buffer.from(data2)).digest();
                      resolve(hash2.buffer);
                    });
                  }
                }
                exports2.sha512 = sha5123;
                function hmacSha256(key, data2) {
                  var _a2;
                  if ((_a2 = __webpack_require__2.g.crypto) === null || _a2 === void 0 ? void 0 : _a2.subtle) {
                    const algo = { name: "HMAC", hash: { name: "SHA-256" } };
                    return __webpack_require__2.g.crypto.subtle.importKey("raw", key, algo, false, ["sign"]).then((subtleKey) => {
                      return __webpack_require__2.g.crypto.subtle.sign(algo, subtleKey, data2);
                    });
                  } else {
                    return new Promise((resolve) => {
                      const hmac2 = nodeCrypto.createHmac("sha256", Buffer.from(key));
                      const hash2 = hmac2.update(Buffer.from(data2)).digest();
                      resolve(hash2.buffer);
                    });
                  }
                }
                exports2.hmacSha256 = hmacSha256;
                class AesCbc {
                }
                exports2.AesCbc = AesCbc;
                class AesCbcSubtle extends AesCbc {
                  get key() {
                    if (!this._key) {
                      throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.InvalidState, "no key");
                    }
                    return this._key;
                  }
                  importKey(key) {
                    return __webpack_require__2.g.crypto.subtle.importKey("raw", key, { name: "AES-CBC" }, false, ["encrypt", "decrypt"]).then((key2) => {
                      this._key = key2;
                    });
                  }
                  encrypt(data2, iv) {
                    return __webpack_require__2.g.crypto.subtle.encrypt({ name: "AES-CBC", iv }, this.key, data2);
                  }
                  decrypt(data2, iv) {
                    return __webpack_require__2.g.crypto.subtle.decrypt({ name: "AES-CBC", iv }, this.key, data2).catch(() => {
                      throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.InvalidKey, "invalid key");
                    });
                  }
                }
                class AesCbcNode extends AesCbc {
                  get key() {
                    if (!this._key) {
                      throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.InvalidState, "no key");
                    }
                    return this._key;
                  }
                  importKey(key) {
                    this._key = key;
                    return Promise.resolve();
                  }
                  encrypt(data2, iv) {
                    return Promise.resolve().then(() => {
                      const cipher = nodeCrypto.createCipheriv("aes-256-cbc", Buffer.from(this.key), Buffer.from(iv));
                      const block = cipher.update(Buffer.from(data2));
                      return (0, byte_utils_1.arrayToBuffer)(Buffer.concat([block, cipher.final()]));
                    });
                  }
                  decrypt(data2, iv) {
                    return Promise.resolve().then(() => {
                      const cipher = nodeCrypto.createDecipheriv("aes-256-cbc", Buffer.from(this.key), Buffer.from(iv));
                      const block = cipher.update(Buffer.from(data2));
                      return (0, byte_utils_1.arrayToBuffer)(Buffer.concat([block, cipher.final()]));
                    }).catch(() => {
                      throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.InvalidKey, "invalid key");
                    });
                  }
                }
                function createAesCbc() {
                  var _a2;
                  if ((_a2 = __webpack_require__2.g.crypto) === null || _a2 === void 0 ? void 0 : _a2.subtle) {
                    return new AesCbcSubtle();
                  } else {
                    return new AesCbcNode();
                  }
                }
                exports2.createAesCbc = createAesCbc;
                function safeRandomWeb(len) {
                  const randomBytes6 = new Uint8Array(len);
                  while (len > 0) {
                    let segmentSize = len % MaxRandomQuota;
                    segmentSize = segmentSize > 0 ? segmentSize : MaxRandomQuota;
                    const randomBytesSegment = new Uint8Array(segmentSize);
                    __webpack_require__2.g.crypto.getRandomValues(randomBytesSegment);
                    len -= segmentSize;
                    randomBytes6.set(randomBytesSegment, len);
                  }
                  return randomBytes6;
                }
                function random(len) {
                  var _a2;
                  if ((_a2 = __webpack_require__2.g.crypto) === null || _a2 === void 0 ? void 0 : _a2.subtle) {
                    return safeRandomWeb(len);
                  } else {
                    return new Uint8Array(nodeCrypto.randomBytes(len));
                  }
                }
                exports2.random = random;
                function chacha20(data2, key, iv) {
                  return Promise.resolve().then(() => {
                    const algo = new chacha20_1.ChaCha20(new Uint8Array(key), new Uint8Array(iv));
                    return (0, byte_utils_1.arrayToBuffer)(algo.encrypt(new Uint8Array(data2)));
                  });
                }
                exports2.chacha20 = chacha20;
                exports2.Argon2TypeArgon2d = 0;
                exports2.Argon2TypeArgon2id = 2;
                let argon2impl;
                function argon22(password, salt, memory, iterations, length, parallelism, type, version2) {
                  if (argon2impl) {
                    return argon2impl(password, salt, memory, iterations, length, parallelism, type, version2).then(byte_utils_1.arrayToBuffer);
                  }
                  return Promise.reject(new kdbx_error_1.KdbxError(consts_1.ErrorCodes.NotImplemented, "argon2 not implemented"));
                }
                exports2.argon2 = argon22;
                function setArgon2Impl(impl2) {
                  argon2impl = impl2;
                }
                exports2.setArgon2Impl = setArgon2Impl;
              })
            ),
            /***/
            "./crypto/hashed-block-transform.ts": (
              /*!******************************************!*\
                !*** ./crypto/hashed-block-transform.ts ***!
                \******************************************/
              /***/
              ((__unused_webpack_module, exports2, __webpack_require__2) => {
                Object.defineProperty(exports2, "__esModule", { value: true });
                exports2.encrypt = exports2.decrypt = void 0;
                const binary_stream_1 = __webpack_require__2(
                  /*! ../utils/binary-stream */
                  "./utils/binary-stream.ts"
                );
                const CryptoEngine2 = __webpack_require__2(
                  /*! ../crypto/crypto-engine */
                  "./crypto/crypto-engine.ts"
                );
                const kdbx_error_1 = __webpack_require__2(
                  /*! ../errors/kdbx-error */
                  "./errors/kdbx-error.ts"
                );
                const byte_utils_1 = __webpack_require__2(
                  /*! ../utils/byte-utils */
                  "./utils/byte-utils.ts"
                );
                const consts_1 = __webpack_require__2(
                  /*! ../defs/consts */
                  "./defs/consts.ts"
                );
                const BlockSize = 1024 * 1024;
                function decrypt2(data2) {
                  return Promise.resolve().then(() => {
                    const stm = new binary_stream_1.BinaryStream(data2);
                    const buffers = [];
                    let blockLength = 0, blockHash, totalLength = 0;
                    const next = () => {
                      stm.getUint32(true);
                      blockHash = stm.readBytes(32);
                      blockLength = stm.getUint32(true);
                      if (blockLength > 0) {
                        totalLength += blockLength;
                        const blockData = stm.readBytes(blockLength);
                        return CryptoEngine2.sha256(blockData).then((calculatedHash) => {
                          if (!(0, byte_utils_1.arrayBufferEquals)(calculatedHash, blockHash)) {
                            throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.FileCorrupt, "invalid hash block");
                          } else {
                            buffers.push(blockData);
                            return next();
                          }
                        });
                      } else {
                        const ret = new Uint8Array(totalLength);
                        let offset = 0;
                        for (let i = 0; i < buffers.length; i++) {
                          ret.set(new Uint8Array(buffers[i]), offset);
                          offset += buffers[i].byteLength;
                        }
                        return Promise.resolve(ret.buffer);
                      }
                    };
                    return next();
                  });
                }
                exports2.decrypt = decrypt2;
                function encrypt(data2) {
                  return Promise.resolve().then(() => {
                    let bytesLeft = data2.byteLength;
                    let currentOffset = 0, blockIndex = 0, totalLength = 0;
                    const buffers = [];
                    const next = () => {
                      if (bytesLeft > 0) {
                        const blockLength = Math.min(BlockSize, bytesLeft);
                        bytesLeft -= blockLength;
                        const blockData = data2.slice(currentOffset, currentOffset + blockLength);
                        return CryptoEngine2.sha256(blockData).then((blockHash) => {
                          const blockBuffer = new ArrayBuffer(4 + 32 + 4);
                          const stm = new binary_stream_1.BinaryStream(blockBuffer);
                          stm.setUint32(blockIndex, true);
                          stm.writeBytes(blockHash);
                          stm.setUint32(blockLength, true);
                          buffers.push(blockBuffer);
                          totalLength += blockBuffer.byteLength;
                          buffers.push(blockData);
                          totalLength += blockData.byteLength;
                          blockIndex++;
                          currentOffset += blockLength;
                          return next();
                        });
                      } else {
                        const endBlockData = new ArrayBuffer(4 + 32 + 4);
                        const view = new DataView(endBlockData);
                        view.setUint32(0, blockIndex, true);
                        buffers.push(endBlockData);
                        totalLength += endBlockData.byteLength;
                        const ret = new Uint8Array(totalLength);
                        let offset = 0;
                        for (let i = 0; i < buffers.length; i++) {
                          ret.set(new Uint8Array(buffers[i]), offset);
                          offset += buffers[i].byteLength;
                        }
                        return Promise.resolve(ret.buffer);
                      }
                    };
                    return next();
                  });
                }
                exports2.encrypt = encrypt;
              })
            ),
            /***/
            "./crypto/hmac-block-transform.ts": (
              /*!****************************************!*\
                !*** ./crypto/hmac-block-transform.ts ***!
                \****************************************/
              /***/
              ((__unused_webpack_module, exports2, __webpack_require__2) => {
                Object.defineProperty(exports2, "__esModule", { value: true });
                exports2.encrypt = exports2.decrypt = exports2.getHmacKey = void 0;
                const int64_1 = __webpack_require__2(
                  /*! ../utils/int64 */
                  "./utils/int64.ts"
                );
                const byte_utils_1 = __webpack_require__2(
                  /*! ../utils/byte-utils */
                  "./utils/byte-utils.ts"
                );
                const CryptoEngine2 = __webpack_require__2(
                  /*! ../crypto/crypto-engine */
                  "./crypto/crypto-engine.ts"
                );
                const binary_stream_1 = __webpack_require__2(
                  /*! ../utils/binary-stream */
                  "./utils/binary-stream.ts"
                );
                const kdbx_error_1 = __webpack_require__2(
                  /*! ../errors/kdbx-error */
                  "./errors/kdbx-error.ts"
                );
                const consts_1 = __webpack_require__2(
                  /*! ../defs/consts */
                  "./defs/consts.ts"
                );
                const BlockSize = 1024 * 1024;
                function getHmacKey(key, blockIndex) {
                  const shaSrc = new Uint8Array(8 + key.byteLength);
                  shaSrc.set(new Uint8Array(key), 8);
                  const view = new DataView(shaSrc.buffer);
                  view.setUint32(0, blockIndex.lo, true);
                  view.setUint32(4, blockIndex.hi, true);
                  return CryptoEngine2.sha512((0, byte_utils_1.arrayToBuffer)(shaSrc)).then((sha) => {
                    (0, byte_utils_1.zeroBuffer)(shaSrc);
                    return sha;
                  });
                }
                exports2.getHmacKey = getHmacKey;
                function getBlockHmac(key, blockIndex, blockLength, blockData) {
                  return getHmacKey(key, new int64_1.Int64(blockIndex)).then((blockKey) => {
                    const blockDataForHash = new Uint8Array(blockData.byteLength + 4 + 8);
                    const blockDataForHashView = new DataView(blockDataForHash.buffer);
                    blockDataForHash.set(new Uint8Array(blockData), 4 + 8);
                    blockDataForHashView.setInt32(0, blockIndex, true);
                    blockDataForHashView.setInt32(8, blockLength, true);
                    return CryptoEngine2.hmacSha256(blockKey, blockDataForHash.buffer);
                  });
                }
                function decrypt2(data2, key) {
                  const stm = new binary_stream_1.BinaryStream(data2);
                  return Promise.resolve().then(() => {
                    const buffers = [];
                    let blockIndex = 0, blockLength = 0, blockHash, totalLength = 0;
                    const next = () => {
                      blockHash = stm.readBytes(32);
                      blockLength = stm.getUint32(true);
                      if (blockLength > 0) {
                        totalLength += blockLength;
                        const blockData = stm.readBytes(blockLength);
                        return getBlockHmac(key, blockIndex, blockLength, blockData).then((calculatedBlockHash) => {
                          if (!(0, byte_utils_1.arrayBufferEquals)(calculatedBlockHash, blockHash)) {
                            throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.FileCorrupt, "invalid hash block");
                          } else {
                            buffers.push(blockData);
                            blockIndex++;
                            return next();
                          }
                        });
                      } else {
                        const ret = new Uint8Array(totalLength);
                        let offset = 0;
                        for (let i = 0; i < buffers.length; i++) {
                          ret.set(new Uint8Array(buffers[i]), offset);
                          offset += buffers[i].byteLength;
                        }
                        return Promise.resolve(ret.buffer);
                      }
                    };
                    return next();
                  });
                }
                exports2.decrypt = decrypt2;
                function encrypt(data2, key) {
                  return Promise.resolve().then(() => {
                    let bytesLeft = data2.byteLength;
                    let currentOffset = 0, blockIndex = 0, totalLength = 0;
                    const buffers = [];
                    const next = () => {
                      const blockLength = Math.min(BlockSize, bytesLeft);
                      bytesLeft -= blockLength;
                      const blockData = data2.slice(currentOffset, currentOffset + blockLength);
                      return getBlockHmac(key, blockIndex, blockLength, blockData).then((blockHash) => {
                        const blockBuffer = new ArrayBuffer(32 + 4);
                        const stm = new binary_stream_1.BinaryStream(blockBuffer);
                        stm.writeBytes(blockHash);
                        stm.setUint32(blockLength, true);
                        buffers.push(blockBuffer);
                        totalLength += blockBuffer.byteLength;
                        if (blockData.byteLength > 0) {
                          buffers.push(blockData);
                          totalLength += blockData.byteLength;
                          blockIndex++;
                          currentOffset += blockLength;
                          return next();
                        } else {
                          const ret = new Uint8Array(totalLength);
                          let offset = 0;
                          for (let i = 0; i < buffers.length; i++) {
                            ret.set(new Uint8Array(buffers[i]), offset);
                            offset += buffers[i].byteLength;
                          }
                          return ret.buffer;
                        }
                      });
                    };
                    return next();
                  });
                }
                exports2.encrypt = encrypt;
              })
            ),
            /***/
            "./crypto/key-encryptor-aes.ts": (
              /*!*************************************!*\
                !*** ./crypto/key-encryptor-aes.ts ***!
                \*************************************/
              /***/
              ((__unused_webpack_module, exports2, __webpack_require__2) => {
                Object.defineProperty(exports2, "__esModule", { value: true });
                exports2.encrypt = void 0;
                const CryptoEngine2 = __webpack_require__2(
                  /*! ./crypto-engine */
                  "./crypto/crypto-engine.ts"
                );
                const byte_utils_1 = __webpack_require__2(
                  /*! ../utils/byte-utils */
                  "./utils/byte-utils.ts"
                );
                const maxRoundsPreIteration = 1e4;
                const aesBlockSize = 16;
                const credentialSize = 32;
                function encrypt(credentials, key, rounds) {
                  const algo = CryptoEngine2.createAesCbc();
                  return algo.importKey((0, byte_utils_1.arrayToBuffer)(key)).then(() => {
                    const resolvers = [];
                    for (let idx = 0; idx < credentialSize; idx += aesBlockSize) {
                      resolvers.push(encryptBlock(algo, credentials.subarray(idx, idx + aesBlockSize), rounds));
                    }
                    return Promise.all(resolvers);
                  }).then((results) => {
                    const res = new Uint8Array(credentialSize);
                    results.forEach((result, idx) => {
                      const base = idx * aesBlockSize;
                      for (let i = 0; i < aesBlockSize; ++i) {
                        res[i + base] = result[i];
                      }
                      (0, byte_utils_1.zeroBuffer)(result);
                    });
                    return res;
                  });
                }
                exports2.encrypt = encrypt;
                function encryptBlock(algo, iv, rounds) {
                  let result = Promise.resolve((0, byte_utils_1.arrayToBuffer)(iv));
                  const buffer = new Uint8Array(aesBlockSize * Math.min(rounds, maxRoundsPreIteration));
                  while (rounds > 0) {
                    const currentRounds = Math.min(rounds, maxRoundsPreIteration);
                    rounds -= currentRounds;
                    const dataLen = aesBlockSize * currentRounds;
                    const zeroData = buffer.length === dataLen ? buffer.buffer : (0, byte_utils_1.arrayToBuffer)(buffer.subarray(0, dataLen));
                    result = encryptBlockBuffer(algo, result, zeroData);
                  }
                  return result.then((res) => {
                    return new Uint8Array(res);
                  });
                }
                function encryptBlockBuffer(algo, promisedIv, buffer) {
                  return promisedIv.then((iv) => {
                    return algo.encrypt(buffer, iv);
                  }).then((buf) => {
                    const res = (0, byte_utils_1.arrayToBuffer)(new Uint8Array(buf).subarray(-2 * aesBlockSize, -aesBlockSize));
                    (0, byte_utils_1.zeroBuffer)(buf);
                    return res;
                  });
                }
              })
            ),
            /***/
            "./crypto/key-encryptor-kdf.ts": (
              /*!*************************************!*\
                !*** ./crypto/key-encryptor-kdf.ts ***!
                \*************************************/
              /***/
              ((__unused_webpack_module, exports2, __webpack_require__2) => {
                Object.defineProperty(exports2, "__esModule", { value: true });
                exports2.encrypt = void 0;
                const CryptoEngine2 = __webpack_require__2(
                  /*! ../crypto/crypto-engine */
                  "./crypto/crypto-engine.ts"
                );
                const KeyEncryptorAes = __webpack_require__2(
                  /*! ./key-encryptor-aes */
                  "./crypto/key-encryptor-aes.ts"
                );
                const kdbx_error_1 = __webpack_require__2(
                  /*! ../errors/kdbx-error */
                  "./errors/kdbx-error.ts"
                );
                const consts_1 = __webpack_require__2(
                  /*! ../defs/consts */
                  "./defs/consts.ts"
                );
                const byte_utils_1 = __webpack_require__2(
                  /*! ../utils/byte-utils */
                  "./utils/byte-utils.ts"
                );
                const int64_1 = __webpack_require__2(
                  /*! ../utils/int64 */
                  "./utils/int64.ts"
                );
                function encrypt(key, kdfParams) {
                  const uuid = kdfParams.get("$UUID");
                  if (!uuid || !(uuid instanceof ArrayBuffer)) {
                    return Promise.reject(new kdbx_error_1.KdbxError(consts_1.ErrorCodes.FileCorrupt, "no kdf uuid"));
                  }
                  const kdfUuid = (0, byte_utils_1.bytesToBase64)(uuid);
                  switch (kdfUuid) {
                    case consts_1.KdfId.Argon2d:
                      return encryptArgon2(key, kdfParams, CryptoEngine2.Argon2TypeArgon2d);
                    case consts_1.KdfId.Argon2id:
                      return encryptArgon2(key, kdfParams, CryptoEngine2.Argon2TypeArgon2id);
                    case consts_1.KdfId.Aes:
                      return encryptAes(key, kdfParams);
                    default:
                      return Promise.reject(new kdbx_error_1.KdbxError(consts_1.ErrorCodes.Unsupported, "bad kdf"));
                  }
                }
                exports2.encrypt = encrypt;
                function encryptArgon2(key, kdfParams, argon2type) {
                  const salt = kdfParams.get("S");
                  if (!(salt instanceof ArrayBuffer) || salt.byteLength !== 32) {
                    return Promise.reject(new kdbx_error_1.KdbxError(consts_1.ErrorCodes.FileCorrupt, "bad argon2 salt"));
                  }
                  const parallelism = toNumber(kdfParams.get("P"));
                  if (typeof parallelism !== "number" || parallelism < 1) {
                    return Promise.reject(new kdbx_error_1.KdbxError(consts_1.ErrorCodes.FileCorrupt, "bad argon2 parallelism"));
                  }
                  const iterations = toNumber(kdfParams.get("I"));
                  if (typeof iterations !== "number" || iterations < 1) {
                    return Promise.reject(new kdbx_error_1.KdbxError(consts_1.ErrorCodes.FileCorrupt, "bad argon2 iterations"));
                  }
                  const memory = toNumber(kdfParams.get("M"));
                  if (typeof memory !== "number" || memory < 1 || memory % 1024 !== 0) {
                    return Promise.reject(new kdbx_error_1.KdbxError(consts_1.ErrorCodes.FileCorrupt, "bad argon2 memory"));
                  }
                  const version2 = kdfParams.get("V");
                  if (version2 !== 19 && version2 !== 16) {
                    return Promise.reject(new kdbx_error_1.KdbxError(consts_1.ErrorCodes.FileCorrupt, "bad argon2 version"));
                  }
                  const secretKey = kdfParams.get("K");
                  if (secretKey) {
                    return Promise.reject(new kdbx_error_1.KdbxError(consts_1.ErrorCodes.Unsupported, "argon2 secret key"));
                  }
                  const assocData = kdfParams.get("A");
                  if (assocData) {
                    return Promise.reject(new kdbx_error_1.KdbxError(consts_1.ErrorCodes.Unsupported, "argon2 assoc data"));
                  }
                  return CryptoEngine2.argon2(key, salt, memory / 1024, iterations, 32, parallelism, argon2type, version2);
                }
                function encryptAes(key, kdfParams) {
                  const salt = kdfParams.get("S");
                  if (!(salt instanceof ArrayBuffer) || salt.byteLength !== 32) {
                    return Promise.reject(new kdbx_error_1.KdbxError(consts_1.ErrorCodes.FileCorrupt, "bad aes salt"));
                  }
                  const rounds = toNumber(kdfParams.get("R"));
                  if (typeof rounds !== "number" || rounds < 1) {
                    return Promise.reject(new kdbx_error_1.KdbxError(consts_1.ErrorCodes.FileCorrupt, "bad aes rounds"));
                  }
                  return KeyEncryptorAes.encrypt(new Uint8Array(key), new Uint8Array(salt), rounds).then((key2) => {
                    return CryptoEngine2.sha256(key2).then((hash2) => {
                      (0, byte_utils_1.zeroBuffer)(key2);
                      return hash2;
                    });
                  });
                }
                function toNumber(number) {
                  if (typeof number === "number") {
                    return number;
                  } else if (number instanceof int64_1.Int64) {
                    return number.value;
                  }
                  return void 0;
                }
              })
            ),
            /***/
            "./crypto/protect-salt-generator.ts": (
              /*!******************************************!*\
                !*** ./crypto/protect-salt-generator.ts ***!
                \******************************************/
              /***/
              ((__unused_webpack_module, exports2, __webpack_require__2) => {
                Object.defineProperty(exports2, "__esModule", { value: true });
                exports2.ProtectSaltGenerator = void 0;
                const salsa20_1 = __webpack_require__2(
                  /*! ./salsa20 */
                  "./crypto/salsa20.ts"
                );
                const chacha20_1 = __webpack_require__2(
                  /*! ./chacha20 */
                  "./crypto/chacha20.ts"
                );
                const byte_utils_1 = __webpack_require__2(
                  /*! ../utils/byte-utils */
                  "./utils/byte-utils.ts"
                );
                const consts_1 = __webpack_require__2(
                  /*! ../defs/consts */
                  "./defs/consts.ts"
                );
                const kdbx_error_1 = __webpack_require__2(
                  /*! ../errors/kdbx-error */
                  "./errors/kdbx-error.ts"
                );
                const CryptoEngine2 = __webpack_require__2(
                  /*! ../crypto/crypto-engine */
                  "./crypto/crypto-engine.ts"
                );
                const SalsaNonce = new Uint8Array([232, 48, 9, 75, 151, 32, 93, 42]);
                class ProtectSaltGenerator {
                  constructor(algo) {
                    this._algo = algo;
                  }
                  getSalt(len) {
                    return (0, byte_utils_1.arrayToBuffer)(this._algo.getBytes(len));
                  }
                  static create(key, crsAlgorithm) {
                    switch (crsAlgorithm) {
                      case consts_1.CrsAlgorithm.Salsa20:
                        return CryptoEngine2.sha256((0, byte_utils_1.arrayToBuffer)(key)).then((hash2) => {
                          const key2 = new Uint8Array(hash2);
                          const algo = new salsa20_1.Salsa20(key2, SalsaNonce);
                          return new ProtectSaltGenerator(algo);
                        });
                      case consts_1.CrsAlgorithm.ChaCha20:
                        return CryptoEngine2.sha512((0, byte_utils_1.arrayToBuffer)(key)).then((hash2) => {
                          const key2 = new Uint8Array(hash2, 0, 32);
                          const nonce = new Uint8Array(hash2, 32, 12);
                          const algo = new chacha20_1.ChaCha20(key2, nonce);
                          return new ProtectSaltGenerator(algo);
                        });
                      default:
                        return Promise.reject(new kdbx_error_1.KdbxError(consts_1.ErrorCodes.Unsupported, "crsAlgorithm"));
                    }
                  }
                }
                exports2.ProtectSaltGenerator = ProtectSaltGenerator;
              })
            ),
            /***/
            "./crypto/protected-value.ts": (
              /*!***********************************!*\
                !*** ./crypto/protected-value.ts ***!
                \***********************************/
              /***/
              ((__unused_webpack_module, exports2, __webpack_require__2) => {
                Object.defineProperty(exports2, "__esModule", { value: true });
                exports2.ProtectedValue = void 0;
                const CryptoEngine2 = __webpack_require__2(
                  /*! ./crypto-engine */
                  "./crypto/crypto-engine.ts"
                );
                const byte_utils_1 = __webpack_require__2(
                  /*! ../utils/byte-utils */
                  "./utils/byte-utils.ts"
                );
                class ProtectedValue2 {
                  constructor(value, salt) {
                    this.value = new Uint8Array(value);
                    this.salt = new Uint8Array(salt);
                  }
                  toString() {
                    return (0, byte_utils_1.bytesToBase64)(this.value);
                  }
                  static fromString(str) {
                    const bytes = (0, byte_utils_1.stringToBytes)(str), salt = CryptoEngine2.random(bytes.length);
                    for (let i = 0, len = bytes.length; i < len; i++) {
                      bytes[i] ^= salt[i];
                    }
                    return new ProtectedValue2((0, byte_utils_1.arrayToBuffer)(bytes), (0, byte_utils_1.arrayToBuffer)(salt));
                  }
                  toBase64() {
                    const binary = this.getBinary();
                    const base64 = (0, byte_utils_1.bytesToBase64)(binary);
                    (0, byte_utils_1.zeroBuffer)(binary);
                    return base64;
                  }
                  static fromBase64(base64) {
                    const bytes = (0, byte_utils_1.base64ToBytes)(base64);
                    return ProtectedValue2.fromBinary(bytes);
                  }
                  /**
                   * Keep in mind that you're passing the ownership of this array, the contents will be destroyed
                   */
                  static fromBinary(binary) {
                    const bytes = new Uint8Array(binary), salt = CryptoEngine2.random(bytes.length);
                    for (let i = 0, len = bytes.length; i < len; i++) {
                      bytes[i] ^= salt[i];
                    }
                    return new ProtectedValue2((0, byte_utils_1.arrayToBuffer)(bytes), (0, byte_utils_1.arrayToBuffer)(salt));
                  }
                  includes(str) {
                    if (str.length === 0) {
                      return false;
                    }
                    const source = this.value, salt = this.salt, search = (0, byte_utils_1.stringToBytes)(str), sourceLen = source.length, searchLen = search.length, maxPos = sourceLen - searchLen;
                    src: for (let sourceIx = 0; sourceIx <= maxPos; sourceIx++) {
                      for (let searchIx = 0; searchIx < searchLen; searchIx++) {
                        if ((source[sourceIx + searchIx] ^ salt[sourceIx + searchIx]) !== search[searchIx]) {
                          continue src;
                        }
                      }
                      return true;
                    }
                    return false;
                  }
                  getHash() {
                    const binary = (0, byte_utils_1.arrayToBuffer)(this.getBinary());
                    return CryptoEngine2.sha256(binary).then((hash2) => {
                      (0, byte_utils_1.zeroBuffer)(binary);
                      return hash2;
                    });
                  }
                  getText() {
                    return (0, byte_utils_1.bytesToString)(this.getBinary());
                  }
                  getBinary() {
                    const value = this.value, salt = this.salt;
                    const bytes = new Uint8Array(value.byteLength);
                    for (let i = bytes.length - 1; i >= 0; i--) {
                      bytes[i] = value[i] ^ salt[i];
                    }
                    return bytes;
                  }
                  setSalt(newSalt) {
                    const newSaltArr = new Uint8Array(newSalt);
                    const value = this.value, salt = this.salt;
                    for (let i = 0, len = value.length; i < len; i++) {
                      value[i] = value[i] ^ salt[i] ^ newSaltArr[i];
                      salt[i] = newSaltArr[i];
                    }
                  }
                  clone() {
                    return new ProtectedValue2(this.value, this.salt);
                  }
                  get byteLength() {
                    return this.value.byteLength;
                  }
                }
                exports2.ProtectedValue = ProtectedValue2;
              })
            ),
            /***/
            "./crypto/salsa20.ts": (
              /*!***************************!*\
                !*** ./crypto/salsa20.ts ***!
                \***************************/
              /***/
              ((__unused_webpack_module, exports2) => {
                Object.defineProperty(exports2, "__esModule", { value: true });
                exports2.Salsa20 = void 0;
                class Salsa20 {
                  constructor(key, nonce) {
                    this._rounds = 20;
                    this._sigmaWords = [1634760805, 857760878, 2036477234, 1797285236];
                    this._keyWords = [];
                    this._nonceWords = [0, 0];
                    this._counterWords = [0, 0];
                    this._block = new Uint8Array(64);
                    this._blockUsed = 64;
                    this.setKey(key);
                    this.setNonce(nonce);
                  }
                  // setKey sets the key to the given 32-byte array.
                  setKey(key) {
                    for (let i = 0, j = 0; i < 8; i++, j += 4) {
                      this._keyWords[i] = key[j] & 255 | (key[j + 1] & 255) << 8 | (key[j + 2] & 255) << 16 | (key[j + 3] & 255) << 24;
                    }
                    this.reset();
                  }
                  // setNonce sets the nonce to the given 8-byte array.
                  setNonce(nonce) {
                    this._nonceWords[0] = nonce[0] & 255 | (nonce[1] & 255) << 8 | (nonce[2] & 255) << 16 | (nonce[3] & 255) << 24;
                    this._nonceWords[1] = nonce[4] & 255 | (nonce[5] & 255) << 8 | (nonce[6] & 255) << 16 | (nonce[7] & 255) << 24;
                    this.reset();
                  }
                  // getBytes returns the next numberOfBytes bytes of stream.
                  getBytes(numberOfBytes) {
                    const out = new Uint8Array(numberOfBytes);
                    for (let i = 0; i < numberOfBytes; i++) {
                      if (this._blockUsed === 64) {
                        this.generateBlock();
                        this.incrementCounter();
                        this._blockUsed = 0;
                      }
                      out[i] = this._block[this._blockUsed];
                      this._blockUsed++;
                    }
                    return out;
                  }
                  getHexString(numberOfBytes) {
                    const hex = [
                      "0",
                      "1",
                      "2",
                      "3",
                      "4",
                      "5",
                      "6",
                      "7",
                      "8",
                      "9",
                      "a",
                      "b",
                      "c",
                      "d",
                      "e",
                      "f"
                    ];
                    const out = [];
                    const bytes = this.getBytes(numberOfBytes);
                    for (let i = 0; i < bytes.length; i++) {
                      out.push(hex[bytes[i] >> 4 & 15]);
                      out.push(hex[bytes[i] & 15]);
                    }
                    return out.join("");
                  }
                  reset() {
                    this._counterWords[0] = 0;
                    this._counterWords[1] = 0;
                    this._blockUsed = 64;
                  }
                  incrementCounter() {
                    this._counterWords[0] = this._counterWords[0] + 1 & 4294967295;
                    if (this._counterWords[0] === 0) {
                      this._counterWords[1] = this._counterWords[1] + 1 & 4294967295;
                    }
                  }
                  // _generateBlock generates 64 bytes from key, nonce, and counter,
                  // and puts the result into this.block.
                  generateBlock() {
                    const j0 = this._sigmaWords[0], j1 = this._keyWords[0], j2 = this._keyWords[1], j3 = this._keyWords[2], j4 = this._keyWords[3], j5 = this._sigmaWords[1], j6 = this._nonceWords[0], j7 = this._nonceWords[1], j8 = this._counterWords[0], j9 = this._counterWords[1], j10 = this._sigmaWords[2], j11 = this._keyWords[4], j12 = this._keyWords[5], j13 = this._keyWords[6], j14 = this._keyWords[7], j15 = this._sigmaWords[3];
                    let x0 = j0, x1 = j1, x2 = j2, x3 = j3, x4 = j4, x5 = j5, x6 = j6, x7 = j7, x8 = j8, x9 = j9, x10 = j10, x11 = j11, x12 = j12, x13 = j13, x14 = j14, x15 = j15;
                    let u;
                    for (let i = 0; i < this._rounds; i += 2) {
                      u = x0 + x12;
                      x4 ^= u << 7 | u >>> 32 - 7;
                      u = x4 + x0;
                      x8 ^= u << 9 | u >>> 32 - 9;
                      u = x8 + x4;
                      x12 ^= u << 13 | u >>> 32 - 13;
                      u = x12 + x8;
                      x0 ^= u << 18 | u >>> 32 - 18;
                      u = x5 + x1;
                      x9 ^= u << 7 | u >>> 32 - 7;
                      u = x9 + x5;
                      x13 ^= u << 9 | u >>> 32 - 9;
                      u = x13 + x9;
                      x1 ^= u << 13 | u >>> 32 - 13;
                      u = x1 + x13;
                      x5 ^= u << 18 | u >>> 32 - 18;
                      u = x10 + x6;
                      x14 ^= u << 7 | u >>> 32 - 7;
                      u = x14 + x10;
                      x2 ^= u << 9 | u >>> 32 - 9;
                      u = x2 + x14;
                      x6 ^= u << 13 | u >>> 32 - 13;
                      u = x6 + x2;
                      x10 ^= u << 18 | u >>> 32 - 18;
                      u = x15 + x11;
                      x3 ^= u << 7 | u >>> 32 - 7;
                      u = x3 + x15;
                      x7 ^= u << 9 | u >>> 32 - 9;
                      u = x7 + x3;
                      x11 ^= u << 13 | u >>> 32 - 13;
                      u = x11 + x7;
                      x15 ^= u << 18 | u >>> 32 - 18;
                      u = x0 + x3;
                      x1 ^= u << 7 | u >>> 32 - 7;
                      u = x1 + x0;
                      x2 ^= u << 9 | u >>> 32 - 9;
                      u = x2 + x1;
                      x3 ^= u << 13 | u >>> 32 - 13;
                      u = x3 + x2;
                      x0 ^= u << 18 | u >>> 32 - 18;
                      u = x5 + x4;
                      x6 ^= u << 7 | u >>> 32 - 7;
                      u = x6 + x5;
                      x7 ^= u << 9 | u >>> 32 - 9;
                      u = x7 + x6;
                      x4 ^= u << 13 | u >>> 32 - 13;
                      u = x4 + x7;
                      x5 ^= u << 18 | u >>> 32 - 18;
                      u = x10 + x9;
                      x11 ^= u << 7 | u >>> 32 - 7;
                      u = x11 + x10;
                      x8 ^= u << 9 | u >>> 32 - 9;
                      u = x8 + x11;
                      x9 ^= u << 13 | u >>> 32 - 13;
                      u = x9 + x8;
                      x10 ^= u << 18 | u >>> 32 - 18;
                      u = x15 + x14;
                      x12 ^= u << 7 | u >>> 32 - 7;
                      u = x12 + x15;
                      x13 ^= u << 9 | u >>> 32 - 9;
                      u = x13 + x12;
                      x14 ^= u << 13 | u >>> 32 - 13;
                      u = x14 + x13;
                      x15 ^= u << 18 | u >>> 32 - 18;
                    }
                    x0 += j0;
                    x1 += j1;
                    x2 += j2;
                    x3 += j3;
                    x4 += j4;
                    x5 += j5;
                    x6 += j6;
                    x7 += j7;
                    x8 += j8;
                    x9 += j9;
                    x10 += j10;
                    x11 += j11;
                    x12 += j12;
                    x13 += j13;
                    x14 += j14;
                    x15 += j15;
                    this._block[0] = x0 >>> 0 & 255;
                    this._block[1] = x0 >>> 8 & 255;
                    this._block[2] = x0 >>> 16 & 255;
                    this._block[3] = x0 >>> 24 & 255;
                    this._block[4] = x1 >>> 0 & 255;
                    this._block[5] = x1 >>> 8 & 255;
                    this._block[6] = x1 >>> 16 & 255;
                    this._block[7] = x1 >>> 24 & 255;
                    this._block[8] = x2 >>> 0 & 255;
                    this._block[9] = x2 >>> 8 & 255;
                    this._block[10] = x2 >>> 16 & 255;
                    this._block[11] = x2 >>> 24 & 255;
                    this._block[12] = x3 >>> 0 & 255;
                    this._block[13] = x3 >>> 8 & 255;
                    this._block[14] = x3 >>> 16 & 255;
                    this._block[15] = x3 >>> 24 & 255;
                    this._block[16] = x4 >>> 0 & 255;
                    this._block[17] = x4 >>> 8 & 255;
                    this._block[18] = x4 >>> 16 & 255;
                    this._block[19] = x4 >>> 24 & 255;
                    this._block[20] = x5 >>> 0 & 255;
                    this._block[21] = x5 >>> 8 & 255;
                    this._block[22] = x5 >>> 16 & 255;
                    this._block[23] = x5 >>> 24 & 255;
                    this._block[24] = x6 >>> 0 & 255;
                    this._block[25] = x6 >>> 8 & 255;
                    this._block[26] = x6 >>> 16 & 255;
                    this._block[27] = x6 >>> 24 & 255;
                    this._block[28] = x7 >>> 0 & 255;
                    this._block[29] = x7 >>> 8 & 255;
                    this._block[30] = x7 >>> 16 & 255;
                    this._block[31] = x7 >>> 24 & 255;
                    this._block[32] = x8 >>> 0 & 255;
                    this._block[33] = x8 >>> 8 & 255;
                    this._block[34] = x8 >>> 16 & 255;
                    this._block[35] = x8 >>> 24 & 255;
                    this._block[36] = x9 >>> 0 & 255;
                    this._block[37] = x9 >>> 8 & 255;
                    this._block[38] = x9 >>> 16 & 255;
                    this._block[39] = x9 >>> 24 & 255;
                    this._block[40] = x10 >>> 0 & 255;
                    this._block[41] = x10 >>> 8 & 255;
                    this._block[42] = x10 >>> 16 & 255;
                    this._block[43] = x10 >>> 24 & 255;
                    this._block[44] = x11 >>> 0 & 255;
                    this._block[45] = x11 >>> 8 & 255;
                    this._block[46] = x11 >>> 16 & 255;
                    this._block[47] = x11 >>> 24 & 255;
                    this._block[48] = x12 >>> 0 & 255;
                    this._block[49] = x12 >>> 8 & 255;
                    this._block[50] = x12 >>> 16 & 255;
                    this._block[51] = x12 >>> 24 & 255;
                    this._block[52] = x13 >>> 0 & 255;
                    this._block[53] = x13 >>> 8 & 255;
                    this._block[54] = x13 >>> 16 & 255;
                    this._block[55] = x13 >>> 24 & 255;
                    this._block[56] = x14 >>> 0 & 255;
                    this._block[57] = x14 >>> 8 & 255;
                    this._block[58] = x14 >>> 16 & 255;
                    this._block[59] = x14 >>> 24 & 255;
                    this._block[60] = x15 >>> 0 & 255;
                    this._block[61] = x15 >>> 8 & 255;
                    this._block[62] = x15 >>> 16 & 255;
                    this._block[63] = x15 >>> 24 & 255;
                  }
                }
                exports2.Salsa20 = Salsa20;
              })
            ),
            /***/
            "./defs/consts.ts": (
              /*!************************!*\
                !*** ./defs/consts.ts ***!
                \************************/
              /***/
              ((__unused_webpack_module, exports2) => {
                Object.defineProperty(exports2, "__esModule", { value: true });
                exports2.Icons = exports2.Defaults = exports2.AutoTypeObfuscationOptions = exports2.CipherId = exports2.KdfId = exports2.CrsAlgorithm = exports2.CompressionAlgorithm = exports2.ErrorCodes = exports2.Signatures = void 0;
                exports2.Signatures = {
                  FileMagic: 2594363651,
                  Sig2Kdbx: 3041655655,
                  Sig2Kdb: 3041655653
                };
                exports2.ErrorCodes = {
                  NotImplemented: "NotImplemented",
                  InvalidArg: "InvalidArg",
                  BadSignature: "BadSignature",
                  InvalidVersion: "InvalidVersion",
                  Unsupported: "Unsupported",
                  FileCorrupt: "FileCorrupt",
                  InvalidKey: "InvalidKey",
                  MergeError: "MergeError",
                  InvalidState: "InvalidState"
                };
                exports2.CompressionAlgorithm = {
                  None: 0,
                  GZip: 1
                };
                exports2.CrsAlgorithm = {
                  Null: 0,
                  ArcFourVariant: 1,
                  Salsa20: 2,
                  ChaCha20: 3
                };
                exports2.KdfId = {
                  Argon2: "72Nt34wpREuR96mkA+MKDA==",
                  Argon2d: "72Nt34wpREuR96mkA+MKDA==",
                  Argon2id: "nimLGVbbR3OyPfw+xvCh5g==",
                  Aes: "ydnzmmKKRGC/dA0IwYpP6g=="
                };
                exports2.CipherId = {
                  Aes: "McHy5r9xQ1C+WAUhavxa/w==",
                  ChaCha20: "1gOKK4tvTLWlJDOaMdu1mg=="
                };
                exports2.AutoTypeObfuscationOptions = {
                  None: 0,
                  UseClipboard: 1
                };
                exports2.Defaults = {
                  KeyEncryptionRounds: 3e5,
                  MntncHistoryDays: 365,
                  HistoryMaxItems: 10,
                  HistoryMaxSize: 6 * 1024 * 1024,
                  RecycleBinName: "Recycle Bin"
                };
                exports2.Icons = {
                  Key: 0,
                  World: 1,
                  Warning: 2,
                  NetworkServer: 3,
                  MarkedDirectory: 4,
                  UserCommunication: 5,
                  Parts: 6,
                  Notepad: 7,
                  WorldSocket: 8,
                  Identity: 9,
                  PaperReady: 10,
                  Digicam: 11,
                  IRCommunication: 12,
                  MultiKeys: 13,
                  Energy: 14,
                  Scanner: 15,
                  WorldStar: 16,
                  CDRom: 17,
                  Monitor: 18,
                  EMail: 19,
                  Configuration: 20,
                  ClipboardReady: 21,
                  PaperNew: 22,
                  Screen: 23,
                  EnergyCareful: 24,
                  EMailBox: 25,
                  Disk: 26,
                  Drive: 27,
                  PaperQ: 28,
                  TerminalEncrypted: 29,
                  Console: 30,
                  Printer: 31,
                  ProgramIcons: 32,
                  Run: 33,
                  Settings: 34,
                  WorldComputer: 35,
                  Archive: 36,
                  Homebanking: 37,
                  DriveWindows: 39,
                  Clock: 39,
                  EMailSearch: 40,
                  PaperFlag: 41,
                  Memory: 42,
                  TrashBin: 43,
                  Note: 44,
                  Expired: 45,
                  Info: 46,
                  Package: 47,
                  Folder: 48,
                  FolderOpen: 49,
                  FolderPackage: 50,
                  LockOpen: 51,
                  PaperLocked: 52,
                  Checked: 53,
                  Pen: 54,
                  Thumbnail: 55,
                  Book: 56,
                  List: 57,
                  UserKey: 58,
                  Tool: 59,
                  Home: 60,
                  Star: 61,
                  Tux: 62,
                  Feather: 63,
                  Apple: 64,
                  Wiki: 65,
                  Money: 66,
                  Certificate: 67,
                  BlackBerry: 68
                };
              })
            ),
            /***/
            "./defs/xml-names.ts": (
              /*!***************************!*\
                !*** ./defs/xml-names.ts ***!
                \***************************/
              /***/
              ((__unused_webpack_module, exports2) => {
                Object.defineProperty(exports2, "__esModule", { value: true });
                exports2.Val = exports2.Attr = exports2.Elem = void 0;
                exports2.Elem = {
                  DocNode: "KeePassFile",
                  Meta: "Meta",
                  Root: "Root",
                  Group: "Group",
                  Entry: "Entry",
                  Generator: "Generator",
                  HeaderHash: "HeaderHash",
                  SettingsChanged: "SettingsChanged",
                  DbName: "DatabaseName",
                  DbNameChanged: "DatabaseNameChanged",
                  DbDesc: "DatabaseDescription",
                  DbDescChanged: "DatabaseDescriptionChanged",
                  DbDefaultUser: "DefaultUserName",
                  DbDefaultUserChanged: "DefaultUserNameChanged",
                  DbMntncHistoryDays: "MaintenanceHistoryDays",
                  DbColor: "Color",
                  DbKeyChanged: "MasterKeyChanged",
                  DbKeyChangeRec: "MasterKeyChangeRec",
                  DbKeyChangeForce: "MasterKeyChangeForce",
                  RecycleBinEnabled: "RecycleBinEnabled",
                  RecycleBinUuid: "RecycleBinUUID",
                  RecycleBinChanged: "RecycleBinChanged",
                  EntryTemplatesGroup: "EntryTemplatesGroup",
                  EntryTemplatesGroupChanged: "EntryTemplatesGroupChanged",
                  HistoryMaxItems: "HistoryMaxItems",
                  HistoryMaxSize: "HistoryMaxSize",
                  LastSelectedGroup: "LastSelectedGroup",
                  LastTopVisibleGroup: "LastTopVisibleGroup",
                  MemoryProt: "MemoryProtection",
                  ProtTitle: "ProtectTitle",
                  ProtUserName: "ProtectUserName",
                  ProtPassword: "ProtectPassword",
                  ProtUrl: "ProtectURL",
                  ProtNotes: "ProtectNotes",
                  CustomIcons: "CustomIcons",
                  CustomIconItem: "Icon",
                  CustomIconItemID: "UUID",
                  CustomIconItemData: "Data",
                  CustomIconItemName: "Name",
                  AutoType: "AutoType",
                  History: "History",
                  Name: "Name",
                  Notes: "Notes",
                  Uuid: "UUID",
                  Icon: "IconID",
                  CustomIconID: "CustomIconUUID",
                  FgColor: "ForegroundColor",
                  BgColor: "BackgroundColor",
                  OverrideUrl: "OverrideURL",
                  Times: "Times",
                  Tags: "Tags",
                  QualityCheck: "QualityCheck",
                  PreviousParentGroup: "PreviousParentGroup",
                  CreationTime: "CreationTime",
                  LastModTime: "LastModificationTime",
                  LastAccessTime: "LastAccessTime",
                  ExpiryTime: "ExpiryTime",
                  Expires: "Expires",
                  UsageCount: "UsageCount",
                  LocationChanged: "LocationChanged",
                  GroupDefaultAutoTypeSeq: "DefaultAutoTypeSequence",
                  EnableAutoType: "EnableAutoType",
                  EnableSearching: "EnableSearching",
                  String: "String",
                  Binary: "Binary",
                  Key: "Key",
                  Value: "Value",
                  AutoTypeEnabled: "Enabled",
                  AutoTypeObfuscation: "DataTransferObfuscation",
                  AutoTypeDefaultSeq: "DefaultSequence",
                  AutoTypeItem: "Association",
                  Window: "Window",
                  KeystrokeSequence: "KeystrokeSequence",
                  Binaries: "Binaries",
                  IsExpanded: "IsExpanded",
                  LastTopVisibleEntry: "LastTopVisibleEntry",
                  DeletedObjects: "DeletedObjects",
                  DeletedObject: "DeletedObject",
                  DeletionTime: "DeletionTime",
                  CustomData: "CustomData",
                  StringDictExItem: "Item"
                };
                exports2.Attr = {
                  Id: "ID",
                  Ref: "Ref",
                  Protected: "Protected",
                  ProtectedInMemPlainXml: "ProtectInMemory",
                  Compressed: "Compressed"
                };
                exports2.Val = {
                  False: "False",
                  True: "True"
                };
              })
            ),
            /***/
            "./errors/kdbx-error.ts": (
              /*!******************************!*\
                !*** ./errors/kdbx-error.ts ***!
                \******************************/
              /***/
              ((__unused_webpack_module, exports2) => {
                Object.defineProperty(exports2, "__esModule", { value: true });
                exports2.KdbxError = void 0;
                class KdbxError extends Error {
                  constructor(code, message) {
                    super("Error " + code + (message ? ": " + message : ""));
                    this.name = "KdbxError";
                    this.code = code;
                  }
                }
                exports2.KdbxError = KdbxError;
              })
            ),
            /***/
            "./format/kdbx-binaries.ts": (
              /*!*********************************!*\
                !*** ./format/kdbx-binaries.ts ***!
                \*********************************/
              /***/
              ((__unused_webpack_module, exports2, __webpack_require__2) => {
                Object.defineProperty(exports2, "__esModule", { value: true });
                exports2.KdbxBinaries = void 0;
                const CryptoEngine2 = __webpack_require__2(
                  /*! ./../crypto/crypto-engine */
                  "./crypto/crypto-engine.ts"
                );
                const protected_value_1 = __webpack_require__2(
                  /*! ../crypto/protected-value */
                  "./crypto/protected-value.ts"
                );
                const byte_utils_1 = __webpack_require__2(
                  /*! ../utils/byte-utils */
                  "./utils/byte-utils.ts"
                );
                class KdbxBinaries {
                  constructor() {
                    this._mapById = /* @__PURE__ */ new Map();
                    this._mapByHash = /* @__PURE__ */ new Map();
                    this._idToHash = /* @__PURE__ */ new Map();
                  }
                  computeHashes() {
                    const promises = [...this._mapById].map(([id, binary]) => KdbxBinaries.getBinaryHash(binary).then((hash2) => {
                      this._idToHash.set(id, hash2);
                      this._mapByHash.set(hash2, binary);
                    }));
                    return Promise.all(promises).then(() => {
                      this._mapById.clear();
                    });
                  }
                  static getBinaryHash(binary) {
                    let promise;
                    if (binary instanceof protected_value_1.ProtectedValue) {
                      promise = binary.getHash();
                    } else {
                      binary = (0, byte_utils_1.arrayToBuffer)(binary);
                      promise = CryptoEngine2.sha256(binary);
                    }
                    return promise.then(byte_utils_1.bytesToHex);
                  }
                  add(value) {
                    if (value instanceof Uint8Array) {
                      value = (0, byte_utils_1.arrayToBuffer)(value);
                    }
                    return KdbxBinaries.getBinaryHash(value).then((hash2) => {
                      this._mapByHash.set(hash2, value);
                      return { hash: hash2, value };
                    });
                  }
                  addWithNextId(value) {
                    const id = this._mapById.size.toString();
                    this.addWithId(id, value);
                  }
                  addWithId(id, value) {
                    if (value instanceof Uint8Array) {
                      value = (0, byte_utils_1.arrayToBuffer)(value);
                    }
                    this._mapById.set(id, value);
                  }
                  addWithHash(binary) {
                    this._mapByHash.set(binary.hash, binary.value);
                  }
                  deleteWithHash(hash2) {
                    this._mapByHash.delete(hash2);
                  }
                  getByRef(binaryRef) {
                    const hash2 = this._idToHash.get(binaryRef.ref);
                    if (!hash2) {
                      return void 0;
                    }
                    const value = this._mapByHash.get(hash2);
                    if (!value) {
                      return void 0;
                    }
                    return { hash: hash2, value };
                  }
                  getRefByHash(hash2) {
                    const ref = [...this._mapByHash.keys()].indexOf(hash2);
                    if (ref < 0) {
                      return void 0;
                    }
                    return { ref: ref.toString() };
                  }
                  getAll() {
                    return [...this._mapByHash.values()].map((value, index) => {
                      return { ref: index.toString(), value };
                    });
                  }
                  getAllWithHashes() {
                    return [...this._mapByHash].map(([hash2, value]) => ({
                      hash: hash2,
                      value
                    }));
                  }
                  getValueByHash(hash2) {
                    return this._mapByHash.get(hash2);
                  }
                  static isKdbxBinaryRef(binary) {
                    var _a2;
                    return !!((_a2 = binary) === null || _a2 === void 0 ? void 0 : _a2.ref);
                  }
                  static isKdbxBinaryWithHash(binary) {
                    var _a2;
                    return !!((_a2 = binary) === null || _a2 === void 0 ? void 0 : _a2.hash);
                  }
                }
                exports2.KdbxBinaries = KdbxBinaries;
              })
            ),
            /***/
            "./format/kdbx-context.ts": (
              /*!********************************!*\
                !*** ./format/kdbx-context.ts ***!
                \********************************/
              /***/
              ((__unused_webpack_module, exports2, __webpack_require__2) => {
                Object.defineProperty(exports2, "__esModule", { value: true });
                exports2.KdbxContext = void 0;
                const XmlUtils = __webpack_require__2(
                  /*! ./../utils/xml-utils */
                  "./utils/xml-utils.ts"
                );
                class KdbxContext {
                  constructor(opts) {
                    this.kdbx = opts.kdbx;
                    this.exportXml = !!opts.exportXml;
                  }
                  setXmlDate(node, dt) {
                    const isBinary = this.kdbx.versionMajor >= 4 && !this.exportXml;
                    XmlUtils.setDate(node, dt, isBinary);
                  }
                }
                exports2.KdbxContext = KdbxContext;
              })
            ),
            /***/
            "./format/kdbx-credentials.ts": (
              /*!************************************!*\
                !*** ./format/kdbx-credentials.ts ***!
                \************************************/
              /***/
              ((__unused_webpack_module, exports2, __webpack_require__2) => {
                Object.defineProperty(exports2, "__esModule", { value: true });
                exports2.KdbxCredentials = void 0;
                const XmlUtils = __webpack_require__2(
                  /*! ../utils/xml-utils */
                  "./utils/xml-utils.ts"
                );
                const CryptoEngine2 = __webpack_require__2(
                  /*! ../crypto/crypto-engine */
                  "./crypto/crypto-engine.ts"
                );
                const protected_value_1 = __webpack_require__2(
                  /*! ../crypto/protected-value */
                  "./crypto/protected-value.ts"
                );
                const kdbx_error_1 = __webpack_require__2(
                  /*! ../errors/kdbx-error */
                  "./errors/kdbx-error.ts"
                );
                const consts_1 = __webpack_require__2(
                  /*! ../defs/consts */
                  "./defs/consts.ts"
                );
                const byte_utils_1 = __webpack_require__2(
                  /*! ../utils/byte-utils */
                  "./utils/byte-utils.ts"
                );
                class KdbxCredentials {
                  constructor(password, keyFile, challengeResponse) {
                    this.ready = Promise.all([
                      this.setPassword(password),
                      this.setKeyFile(keyFile),
                      this.setChallengeResponse(challengeResponse)
                    ]).then(() => this);
                  }
                  setPassword(password) {
                    if (!password) {
                      this.passwordHash = void 0;
                      return Promise.resolve();
                    } else if (password instanceof protected_value_1.ProtectedValue) {
                      return password.getHash().then((hash2) => {
                        this.passwordHash = protected_value_1.ProtectedValue.fromBinary(hash2);
                      });
                    } else {
                      return Promise.reject(new kdbx_error_1.KdbxError(consts_1.ErrorCodes.InvalidArg, "password"));
                    }
                  }
                  setKeyFile(keyFile) {
                    if (keyFile && !(keyFile instanceof ArrayBuffer) && !(keyFile instanceof Uint8Array)) {
                      return Promise.reject(new kdbx_error_1.KdbxError(consts_1.ErrorCodes.InvalidArg, "keyFile"));
                    }
                    if (keyFile) {
                      if (keyFile.byteLength === 32) {
                        this.keyFileHash = protected_value_1.ProtectedValue.fromBinary((0, byte_utils_1.arrayToBuffer)(keyFile));
                        return Promise.resolve();
                      }
                      let keyFileVersion;
                      let dataEl;
                      try {
                        const keyFileStr = (0, byte_utils_1.bytesToString)((0, byte_utils_1.arrayToBuffer)(keyFile));
                        if (/^[a-f\d]{64}$/i.exec(keyFileStr)) {
                          const bytes = (0, byte_utils_1.hexToBytes)(keyFileStr);
                          this.keyFileHash = protected_value_1.ProtectedValue.fromBinary(bytes);
                          return Promise.resolve();
                        }
                        const xml = XmlUtils.parse(keyFileStr.trim());
                        const metaEl = XmlUtils.getChildNode(xml.documentElement, "Meta");
                        if (!metaEl) {
                          return Promise.reject(new kdbx_error_1.KdbxError(consts_1.ErrorCodes.InvalidArg, "key file without meta"));
                        }
                        const versionEl = XmlUtils.getChildNode(metaEl, "Version");
                        if (!(versionEl === null || versionEl === void 0 ? void 0 : versionEl.textContent)) {
                          return Promise.reject(new kdbx_error_1.KdbxError(consts_1.ErrorCodes.InvalidArg, "key file without version"));
                        }
                        keyFileVersion = +versionEl.textContent.split(".")[0];
                        const keyEl = XmlUtils.getChildNode(xml.documentElement, "Key");
                        if (!keyEl) {
                          return Promise.reject(new kdbx_error_1.KdbxError(consts_1.ErrorCodes.InvalidArg, "key file without key"));
                        }
                        dataEl = XmlUtils.getChildNode(keyEl, "Data");
                        if (!(dataEl === null || dataEl === void 0 ? void 0 : dataEl.textContent)) {
                          return Promise.reject(new kdbx_error_1.KdbxError(consts_1.ErrorCodes.InvalidArg, "key file without key data"));
                        }
                      } catch (e) {
                        return CryptoEngine2.sha256(keyFile).then((hash2) => {
                          this.keyFileHash = protected_value_1.ProtectedValue.fromBinary(hash2);
                        });
                      }
                      switch (keyFileVersion) {
                        case 1:
                          this.keyFileHash = protected_value_1.ProtectedValue.fromBinary((0, byte_utils_1.base64ToBytes)(dataEl.textContent));
                          break;
                        case 2: {
                          const keyFileData = (0, byte_utils_1.hexToBytes)(dataEl.textContent.replace(/\s+/g, ""));
                          const keyFileDataHash = dataEl.getAttribute("Hash");
                          return CryptoEngine2.sha256(keyFileData).then((computedHash) => {
                            const computedHashStr = (0, byte_utils_1.bytesToHex)(new Uint8Array(computedHash).subarray(0, 4)).toUpperCase();
                            if (computedHashStr !== keyFileDataHash) {
                              throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.FileCorrupt, "key file data hash mismatch");
                            }
                            this.keyFileHash = protected_value_1.ProtectedValue.fromBinary(keyFileData);
                          });
                        }
                        default: {
                          return Promise.reject(new kdbx_error_1.KdbxError(consts_1.ErrorCodes.FileCorrupt, "bad keyfile version"));
                        }
                      }
                    } else {
                      this.keyFileHash = void 0;
                    }
                    return Promise.resolve();
                  }
                  setChallengeResponse(challengeResponse) {
                    this._challengeResponse = challengeResponse;
                    return Promise.resolve();
                  }
                  getHash(challenge) {
                    return this.ready.then(() => {
                      return this.getChallengeResponse(challenge).then((chalResp) => {
                        const buffers = [];
                        if (this.passwordHash) {
                          buffers.push(this.passwordHash.getBinary());
                        }
                        if (this.keyFileHash) {
                          buffers.push(this.keyFileHash.getBinary());
                        }
                        if (chalResp) {
                          buffers.push(new Uint8Array(chalResp));
                        }
                        const totalLength = buffers.reduce((acc, buf) => acc + buf.byteLength, 0);
                        const allBytes = new Uint8Array(totalLength);
                        let offset = 0;
                        for (const buffer of buffers) {
                          allBytes.set(buffer, offset);
                          (0, byte_utils_1.zeroBuffer)(buffer);
                          offset += buffer.length;
                        }
                        return CryptoEngine2.sha256((0, byte_utils_1.arrayToBuffer)(allBytes)).then((hash2) => {
                          (0, byte_utils_1.zeroBuffer)(allBytes);
                          return hash2;
                        });
                      });
                    });
                  }
                  getChallengeResponse(challenge) {
                    return Promise.resolve().then(() => {
                      if (!this._challengeResponse || !challenge) {
                        return null;
                      }
                      return this._challengeResponse(challenge).then((response) => {
                        return CryptoEngine2.sha256((0, byte_utils_1.arrayToBuffer)(response)).then((hash2) => {
                          (0, byte_utils_1.zeroBuffer)(response);
                          return hash2;
                        });
                      });
                    });
                  }
                  static createRandomKeyFile(version2 = 1) {
                    const keyLength = 32;
                    const keyBytes = CryptoEngine2.random(keyLength), salt = CryptoEngine2.random(keyLength);
                    for (let i = 0; i < keyLength; i++) {
                      keyBytes[i] ^= salt[i];
                      keyBytes[i] ^= Math.random() * 1e3 % 255;
                    }
                    return KdbxCredentials.createKeyFileWithHash(keyBytes, version2);
                  }
                  static createKeyFileWithHash(keyBytes, version2 = 1) {
                    const xmlVersion = version2 === 2 ? "2.0" : "1.00";
                    const dataPadding = "        ";
                    let makeDataElPromise;
                    if (version2 === 2) {
                      const keyDataPadding = dataPadding + "    ";
                      makeDataElPromise = CryptoEngine2.sha256(keyBytes).then((computedHash) => {
                        const keyHash = (0, byte_utils_1.bytesToHex)(new Uint8Array(computedHash).subarray(0, 4)).toUpperCase();
                        const keyStr = (0, byte_utils_1.bytesToHex)(keyBytes).toUpperCase();
                        let dataElXml = dataPadding + '<Data Hash="' + keyHash + '">\n';
                        for (let num = 0; num < 2; num++) {
                          const parts = [0, 1, 2, 3].map((ix) => {
                            return keyStr.substr(num * 32 + ix * 8, 8);
                          });
                          dataElXml += keyDataPadding;
                          dataElXml += parts.join(" ");
                          dataElXml += "\n";
                        }
                        dataElXml += dataPadding + "</Data>\n";
                        return dataElXml;
                      });
                    } else {
                      const dataElXml = dataPadding + "<Data>" + (0, byte_utils_1.bytesToBase64)(keyBytes) + "</Data>\n";
                      makeDataElPromise = Promise.resolve(dataElXml);
                    }
                    return makeDataElPromise.then((dataElXml) => {
                      const xml = '<?xml version="1.0" encoding="utf-8"?>\n<KeyFile>\n    <Meta>\n        <Version>' + xmlVersion + "</Version>\n    </Meta>\n    <Key>\n" + dataElXml + "    </Key>\n</KeyFile>";
                      return (0, byte_utils_1.stringToBytes)(xml);
                    });
                  }
                }
                exports2.KdbxCredentials = KdbxCredentials;
              })
            ),
            /***/
            "./format/kdbx-custom-data.ts": (
              /*!************************************!*\
                !*** ./format/kdbx-custom-data.ts ***!
                \************************************/
              /***/
              ((__unused_webpack_module, exports2, __webpack_require__2) => {
                Object.defineProperty(exports2, "__esModule", { value: true });
                exports2.KdbxCustomData = void 0;
                const XmlUtils = __webpack_require__2(
                  /*! ../utils/xml-utils */
                  "./utils/xml-utils.ts"
                );
                const XmlNames = __webpack_require__2(
                  /*! ../defs/xml-names */
                  "./defs/xml-names.ts"
                );
                class KdbxCustomData {
                  static read(node) {
                    const customData = /* @__PURE__ */ new Map();
                    for (let i = 0, cn = node.childNodes, len = cn.length; i < len; i++) {
                      const childNode = cn[i];
                      if (childNode.tagName === XmlNames.Elem.StringDictExItem) {
                        this.readItem(childNode, customData);
                      }
                    }
                    return customData;
                  }
                  static write(parentNode, ctx, customData) {
                    if (!customData) {
                      return;
                    }
                    const node = XmlUtils.addChildNode(parentNode, XmlNames.Elem.CustomData);
                    for (const [key, item] of customData) {
                      if (item === null || item === void 0 ? void 0 : item.value) {
                        const itemNode = XmlUtils.addChildNode(node, XmlNames.Elem.StringDictExItem);
                        XmlUtils.setText(XmlUtils.addChildNode(itemNode, XmlNames.Elem.Key), key);
                        XmlUtils.setText(XmlUtils.addChildNode(itemNode, XmlNames.Elem.Value), item.value);
                        if (item.lastModified && ctx.kdbx.versionIsAtLeast(4, 1)) {
                          XmlUtils.setDate(XmlUtils.addChildNode(itemNode, XmlNames.Elem.LastModTime), item.lastModified);
                        }
                      }
                    }
                  }
                  static readItem(node, customData) {
                    let key, value, lastModified;
                    for (let i = 0, cn = node.childNodes, len = cn.length; i < len; i++) {
                      const childNode = cn[i];
                      switch (childNode.tagName) {
                        case XmlNames.Elem.Key:
                          key = XmlUtils.getText(childNode);
                          break;
                        case XmlNames.Elem.Value:
                          value = XmlUtils.getText(childNode);
                          break;
                        case XmlNames.Elem.LastModTime:
                          lastModified = XmlUtils.getDate(childNode);
                          break;
                      }
                    }
                    if (key && value !== void 0) {
                      const item = { value };
                      if (lastModified) {
                        item.lastModified = lastModified;
                      }
                      customData.set(key, item);
                    }
                  }
                }
                exports2.KdbxCustomData = KdbxCustomData;
              })
            ),
            /***/
            "./format/kdbx-deleted-object.ts": (
              /*!***************************************!*\
                !*** ./format/kdbx-deleted-object.ts ***!
                \***************************************/
              /***/
              ((__unused_webpack_module, exports2, __webpack_require__2) => {
                Object.defineProperty(exports2, "__esModule", { value: true });
                exports2.KdbxDeletedObject = void 0;
                const XmlUtils = __webpack_require__2(
                  /*! ../utils/xml-utils */
                  "./utils/xml-utils.ts"
                );
                const XmlNames = __webpack_require__2(
                  /*! ../defs/xml-names */
                  "./defs/xml-names.ts"
                );
                class KdbxDeletedObject {
                  readNode(node) {
                    switch (node.tagName) {
                      case XmlNames.Elem.Uuid:
                        this.uuid = XmlUtils.getUuid(node);
                        break;
                      case XmlNames.Elem.DeletionTime:
                        this.deletionTime = XmlUtils.getDate(node);
                        break;
                    }
                  }
                  write(parentNode, ctx) {
                    const node = XmlUtils.addChildNode(parentNode, XmlNames.Elem.DeletedObject);
                    XmlUtils.setUuid(XmlUtils.addChildNode(node, XmlNames.Elem.Uuid), this.uuid);
                    ctx.setXmlDate(XmlUtils.addChildNode(node, XmlNames.Elem.DeletionTime), this.deletionTime);
                  }
                  static read(xmlNode) {
                    const obj = new KdbxDeletedObject();
                    for (let i = 0, cn = xmlNode.childNodes, len = cn.length; i < len; i++) {
                      const childNode = cn[i];
                      if (childNode.tagName) {
                        obj.readNode(childNode);
                      }
                    }
                    return obj;
                  }
                }
                exports2.KdbxDeletedObject = KdbxDeletedObject;
              })
            ),
            /***/
            "./format/kdbx-entry.ts": (
              /*!******************************!*\
                !*** ./format/kdbx-entry.ts ***!
                \******************************/
              /***/
              ((__unused_webpack_module, exports2, __webpack_require__2) => {
                Object.defineProperty(exports2, "__esModule", { value: true });
                exports2.KdbxEntry = void 0;
                const XmlNames = __webpack_require__2(
                  /*! ./../defs/xml-names */
                  "./defs/xml-names.ts"
                );
                const XmlUtils = __webpack_require__2(
                  /*! ./../utils/xml-utils */
                  "./utils/xml-utils.ts"
                );
                const kdbx_times_1 = __webpack_require__2(
                  /*! ./kdbx-times */
                  "./format/kdbx-times.ts"
                );
                const consts_1 = __webpack_require__2(
                  /*! ../defs/consts */
                  "./defs/consts.ts"
                );
                const protected_value_1 = __webpack_require__2(
                  /*! ../crypto/protected-value */
                  "./crypto/protected-value.ts"
                );
                const kdbx_custom_data_1 = __webpack_require__2(
                  /*! ./kdbx-custom-data */
                  "./format/kdbx-custom-data.ts"
                );
                const kdbx_uuid_1 = __webpack_require__2(
                  /*! ./kdbx-uuid */
                  "./format/kdbx-uuid.ts"
                );
                const kdbx_binaries_1 = __webpack_require__2(
                  /*! ./kdbx-binaries */
                  "./format/kdbx-binaries.ts"
                );
                class KdbxEntry {
                  constructor() {
                    this.uuid = new kdbx_uuid_1.KdbxUuid();
                    this.tags = [];
                    this.times = new kdbx_times_1.KdbxTimes();
                    this.fields = /* @__PURE__ */ new Map();
                    this.binaries = /* @__PURE__ */ new Map();
                    this.autoType = {
                      enabled: true,
                      obfuscation: consts_1.AutoTypeObfuscationOptions.None,
                      items: []
                    };
                    this.history = [];
                  }
                  get lastModTime() {
                    var _a2, _b;
                    return (_b = (_a2 = this.times.lastModTime) === null || _a2 === void 0 ? void 0 : _a2.getTime()) !== null && _b !== void 0 ? _b : 0;
                  }
                  get locationChanged() {
                    var _a2, _b;
                    return (_b = (_a2 = this.times.locationChanged) === null || _a2 === void 0 ? void 0 : _a2.getTime()) !== null && _b !== void 0 ? _b : 0;
                  }
                  readNode(node, ctx) {
                    var _a2, _b;
                    switch (node.tagName) {
                      case XmlNames.Elem.Uuid:
                        this.uuid = (_a2 = XmlUtils.getUuid(node)) !== null && _a2 !== void 0 ? _a2 : new kdbx_uuid_1.KdbxUuid();
                        break;
                      case XmlNames.Elem.Icon:
                        this.icon = XmlUtils.getNumber(node) || consts_1.Icons.Key;
                        break;
                      case XmlNames.Elem.CustomIconID:
                        this.customIcon = XmlUtils.getUuid(node);
                        break;
                      case XmlNames.Elem.FgColor:
                        this.fgColor = XmlUtils.getText(node);
                        break;
                      case XmlNames.Elem.BgColor:
                        this.bgColor = XmlUtils.getText(node);
                        break;
                      case XmlNames.Elem.OverrideUrl:
                        this.overrideUrl = XmlUtils.getText(node);
                        break;
                      case XmlNames.Elem.Tags:
                        this.tags = XmlUtils.getTags(node);
                        break;
                      case XmlNames.Elem.Times:
                        this.times = kdbx_times_1.KdbxTimes.read(node);
                        break;
                      case XmlNames.Elem.String:
                        this.readField(node);
                        break;
                      case XmlNames.Elem.Binary:
                        this.readBinary(node, ctx);
                        break;
                      case XmlNames.Elem.AutoType:
                        this.readAutoType(node);
                        break;
                      case XmlNames.Elem.History:
                        this.readHistory(node, ctx);
                        break;
                      case XmlNames.Elem.CustomData:
                        this.readCustomData(node);
                        break;
                      case XmlNames.Elem.QualityCheck:
                        this.qualityCheck = (_b = XmlUtils.getBoolean(node)) !== null && _b !== void 0 ? _b : void 0;
                        break;
                      case XmlNames.Elem.PreviousParentGroup:
                        this.previousParentGroup = XmlUtils.getUuid(node);
                        break;
                    }
                  }
                  readField(node) {
                    const keyNode = XmlUtils.getChildNode(node, XmlNames.Elem.Key), valueNode = XmlUtils.getChildNode(node, XmlNames.Elem.Value);
                    if (keyNode && valueNode) {
                      const key = XmlUtils.getText(keyNode), value = XmlUtils.getProtectedText(valueNode);
                      if (key) {
                        this.fields.set(key, value || "");
                      }
                    }
                  }
                  writeFields(parentNode) {
                    for (const [field, value] of this.fields) {
                      if (value !== void 0 && value !== null) {
                        const node = XmlUtils.addChildNode(parentNode, XmlNames.Elem.String);
                        XmlUtils.setText(XmlUtils.addChildNode(node, XmlNames.Elem.Key), field);
                        XmlUtils.setProtectedText(XmlUtils.addChildNode(node, XmlNames.Elem.Value), value);
                      }
                    }
                  }
                  readBinary(node, ctx) {
                    const keyNode = XmlUtils.getChildNode(node, XmlNames.Elem.Key), valueNode = XmlUtils.getChildNode(node, XmlNames.Elem.Value);
                    if (keyNode && valueNode) {
                      const key = XmlUtils.getText(keyNode), value = XmlUtils.getProtectedBinary(valueNode);
                      if (key && value) {
                        if (kdbx_binaries_1.KdbxBinaries.isKdbxBinaryRef(value)) {
                          const binary = ctx.kdbx.binaries.getByRef(value);
                          if (binary) {
                            this.binaries.set(key, binary);
                          }
                        } else {
                          this.binaries.set(key, value);
                        }
                      }
                    }
                  }
                  writeBinaries(parentNode, ctx) {
                    for (const [id, data2] of this.binaries) {
                      let bin;
                      if (kdbx_binaries_1.KdbxBinaries.isKdbxBinaryWithHash(data2)) {
                        const binaryRef = ctx.kdbx.binaries.getRefByHash(data2.hash);
                        if (!binaryRef) {
                          return;
                        }
                        bin = binaryRef;
                      } else {
                        bin = data2;
                      }
                      const node = XmlUtils.addChildNode(parentNode, XmlNames.Elem.Binary);
                      XmlUtils.setText(XmlUtils.addChildNode(node, XmlNames.Elem.Key), id);
                      XmlUtils.setProtectedBinary(XmlUtils.addChildNode(node, XmlNames.Elem.Value), bin);
                    }
                  }
                  readAutoType(node) {
                    var _a2;
                    for (let i = 0, cn = node.childNodes, len = cn.length; i < len; i++) {
                      const childNode = cn[i];
                      switch (childNode.tagName) {
                        case XmlNames.Elem.AutoTypeEnabled:
                          this.autoType.enabled = (_a2 = XmlUtils.getBoolean(childNode)) !== null && _a2 !== void 0 ? _a2 : true;
                          break;
                        case XmlNames.Elem.AutoTypeObfuscation:
                          this.autoType.obfuscation = XmlUtils.getNumber(childNode) || consts_1.AutoTypeObfuscationOptions.None;
                          break;
                        case XmlNames.Elem.AutoTypeDefaultSeq:
                          this.autoType.defaultSequence = XmlUtils.getText(childNode);
                          break;
                        case XmlNames.Elem.AutoTypeItem:
                          this.readAutoTypeItem(childNode);
                          break;
                      }
                    }
                  }
                  readAutoTypeItem(node) {
                    let window2 = "";
                    let keystrokeSequence = "";
                    for (let i = 0, cn = node.childNodes, len = cn.length; i < len; i++) {
                      const childNode = cn[i];
                      switch (childNode.tagName) {
                        case XmlNames.Elem.Window:
                          window2 = XmlUtils.getText(childNode) || "";
                          break;
                        case XmlNames.Elem.KeystrokeSequence:
                          keystrokeSequence = XmlUtils.getText(childNode) || "";
                          break;
                      }
                    }
                    if (window2 && keystrokeSequence) {
                      this.autoType.items.push({ window: window2, keystrokeSequence });
                    }
                  }
                  writeAutoType(parentNode) {
                    const node = XmlUtils.addChildNode(parentNode, XmlNames.Elem.AutoType);
                    XmlUtils.setBoolean(XmlUtils.addChildNode(node, XmlNames.Elem.AutoTypeEnabled), this.autoType.enabled);
                    XmlUtils.setNumber(XmlUtils.addChildNode(node, XmlNames.Elem.AutoTypeObfuscation), this.autoType.obfuscation || consts_1.AutoTypeObfuscationOptions.None);
                    if (this.autoType.defaultSequence) {
                      XmlUtils.setText(XmlUtils.addChildNode(node, XmlNames.Elem.AutoTypeDefaultSeq), this.autoType.defaultSequence);
                    }
                    for (let i = 0; i < this.autoType.items.length; i++) {
                      const item = this.autoType.items[i];
                      const itemNode = XmlUtils.addChildNode(node, XmlNames.Elem.AutoTypeItem);
                      XmlUtils.setText(XmlUtils.addChildNode(itemNode, XmlNames.Elem.Window), item.window);
                      XmlUtils.setText(XmlUtils.addChildNode(itemNode, XmlNames.Elem.KeystrokeSequence), item.keystrokeSequence);
                    }
                  }
                  readHistory(node, ctx) {
                    for (let i = 0, cn = node.childNodes, len = cn.length; i < len; i++) {
                      const childNode = cn[i];
                      switch (childNode.tagName) {
                        case XmlNames.Elem.Entry:
                          this.history.push(KdbxEntry.read(childNode, ctx));
                          break;
                      }
                    }
                  }
                  writeHistory(parentNode, ctx) {
                    const historyNode = XmlUtils.addChildNode(parentNode, XmlNames.Elem.History);
                    for (const historyEntry of this.history) {
                      historyEntry.write(historyNode, ctx);
                    }
                  }
                  readCustomData(node) {
                    this.customData = kdbx_custom_data_1.KdbxCustomData.read(node);
                  }
                  writeCustomData(parentNode, ctx) {
                    if (this.customData) {
                      kdbx_custom_data_1.KdbxCustomData.write(parentNode, ctx, this.customData);
                    }
                  }
                  setField(name2, str, secure = false) {
                    this.fields.set(name2, secure ? protected_value_1.ProtectedValue.fromString(str) : str);
                  }
                  addHistoryTombstone(isAdded, dt) {
                    if (!this._editState) {
                      this._editState = { added: [], deleted: [] };
                    }
                    this._editState[isAdded ? "added" : "deleted"].push(dt.getTime());
                  }
                  write(parentNode, ctx) {
                    const node = XmlUtils.addChildNode(parentNode, XmlNames.Elem.Entry);
                    XmlUtils.setUuid(XmlUtils.addChildNode(node, XmlNames.Elem.Uuid), this.uuid);
                    XmlUtils.setNumber(XmlUtils.addChildNode(node, XmlNames.Elem.Icon), this.icon || consts_1.Icons.Key);
                    if (this.customIcon) {
                      XmlUtils.setUuid(XmlUtils.addChildNode(node, XmlNames.Elem.CustomIconID), this.customIcon);
                    }
                    XmlUtils.setText(XmlUtils.addChildNode(node, XmlNames.Elem.FgColor), this.fgColor);
                    XmlUtils.setText(XmlUtils.addChildNode(node, XmlNames.Elem.BgColor), this.bgColor);
                    XmlUtils.setText(XmlUtils.addChildNode(node, XmlNames.Elem.OverrideUrl), this.overrideUrl);
                    XmlUtils.setTags(XmlUtils.addChildNode(node, XmlNames.Elem.Tags), this.tags);
                    if (typeof this.qualityCheck === "boolean" && ctx.kdbx.versionIsAtLeast(4, 1)) {
                      XmlUtils.setBoolean(XmlUtils.addChildNode(node, XmlNames.Elem.QualityCheck), this.qualityCheck);
                    }
                    if (this.previousParentGroup !== void 0 && ctx.kdbx.versionIsAtLeast(4, 1)) {
                      XmlUtils.setUuid(XmlUtils.addChildNode(node, XmlNames.Elem.PreviousParentGroup), this.previousParentGroup);
                    }
                    this.times.write(node, ctx);
                    this.writeFields(node);
                    this.writeBinaries(node, ctx);
                    this.writeAutoType(node);
                    this.writeCustomData(node, ctx);
                    if (parentNode.tagName !== XmlNames.Elem.History) {
                      this.writeHistory(node, ctx);
                    }
                  }
                  pushHistory() {
                    const historyEntry = new KdbxEntry();
                    historyEntry.copyFrom(this);
                    this.history.push(historyEntry);
                    if (historyEntry.times.lastModTime) {
                      this.addHistoryTombstone(true, historyEntry.times.lastModTime);
                    }
                  }
                  removeHistory(index, count = 1) {
                    for (let ix = index; ix < index + count; ix++) {
                      if (ix < this.history.length) {
                        const lastModTime = this.history[ix].times.lastModTime;
                        if (lastModTime) {
                          this.addHistoryTombstone(false, lastModTime);
                        }
                      }
                    }
                    this.history.splice(index, count);
                  }
                  copyFrom(entry) {
                    this.uuid = entry.uuid;
                    this.icon = entry.icon;
                    this.customIcon = entry.customIcon;
                    this.fgColor = entry.fgColor;
                    this.bgColor = entry.bgColor;
                    this.overrideUrl = entry.overrideUrl;
                    this.tags = entry.tags.slice();
                    this.times = entry.times.clone();
                    this.fields = /* @__PURE__ */ new Map();
                    for (const [name2, value] of entry.fields) {
                      if (value instanceof protected_value_1.ProtectedValue) {
                        this.fields.set(name2, value.clone());
                      } else {
                        this.fields.set(name2, value);
                      }
                    }
                    this.binaries = /* @__PURE__ */ new Map();
                    for (const [name2, value] of entry.binaries) {
                      if (value instanceof protected_value_1.ProtectedValue) {
                        this.binaries.set(name2, value.clone());
                      } else if (kdbx_binaries_1.KdbxBinaries.isKdbxBinaryWithHash(value)) {
                        this.binaries.set(name2, { hash: value.hash, value: value.value });
                      } else {
                        this.binaries.set(name2, value);
                      }
                    }
                    this.autoType = JSON.parse(JSON.stringify(entry.autoType));
                  }
                  merge(objectMap) {
                    const remoteEntry = objectMap.remoteEntries.get(this.uuid.id);
                    if (!remoteEntry) {
                      return;
                    }
                    const remoteHistory = remoteEntry.history.slice();
                    if (this.lastModTime < remoteEntry.lastModTime) {
                      this.pushHistory();
                      this.copyFrom(remoteEntry);
                    } else if (this.lastModTime > remoteEntry.lastModTime) {
                      const existsInHistory = this.history.some((historyEntry) => {
                        return historyEntry.lastModTime === remoteEntry.lastModTime;
                      });
                      if (!existsInHistory) {
                        const historyEntry = new KdbxEntry();
                        historyEntry.copyFrom(remoteEntry);
                        remoteHistory.push(historyEntry);
                      }
                    }
                    this.history = this.mergeHistory(remoteHistory, remoteEntry.lastModTime);
                  }
                  /**
                   * Merge entry history with remote entry history
                   * Tombstones are stored locally and must be immediately discarded by replica after successful upstream push.
                   * It's client responsibility, to save and load tombstones for local replica, and to clear them after successful upstream push.
                   *
                   * Implements remove-win OR-set CRDT with local tombstones stored in _editState.
                   *
                   * Format doesn't allow saving tombstones for history entries, so they are stored locally.
                   * Any unmodified state from past or modifications of current state synced with central upstream will be successfully merged.
                   * Assumes there's only one central upstream, may produce inconsistencies while merging outdated replica outside main upstream.
                   * Phantom entries and phantom deletions will appear if remote replica checked out an old state and has just added a new state.
                   * If a client is using central upstream for sync, the remote replica must first sync it state and
                   * only after it update the upstream, so this should never happen.
                   *
                   * References:
                   *
                   * An Optimized Conflict-free Replicated Set arXiv:1210.3368 [cs.DC]
                   * http://arxiv.org/abs/1210.3368
                   *
                   * Gene T. J. Wuu and Arthur J. Bernstein. Efficient solutions to the replicated log and dictionary
                   * problems. In Symp. on Principles of Dist. Comp. (PODC), pages 233–242, Vancouver, BC, Canada, August 1984.
                   * https://pages.lip6.fr/Marc.Shapiro/papers/RR-7687.pdf
                   */
                  mergeHistory(remoteHistory, remoteLastModTime) {
                    this.history.sort((x, y) => x.lastModTime - y.lastModTime);
                    remoteHistory.sort((x, y) => x.lastModTime - y.lastModTime);
                    let historyIx = 0, remoteHistoryIx = 0;
                    const newHistory = [];
                    while (historyIx < this.history.length || remoteHistoryIx < remoteHistory.length) {
                      const historyEntry = this.history[historyIx], remoteHistoryEntry = remoteHistory[remoteHistoryIx], entryTime = historyEntry && historyEntry.lastModTime, remoteEntryTime = remoteHistoryEntry && remoteHistoryEntry.lastModTime;
                      if (entryTime === remoteEntryTime) {
                        newHistory.push(historyEntry);
                        historyIx++;
                        remoteHistoryIx++;
                        continue;
                      }
                      if (!historyEntry || entryTime > remoteEntryTime) {
                        if (!this._editState || this._editState.deleted.indexOf(remoteEntryTime) < 0) {
                          const remoteHistoryEntryClone = new KdbxEntry();
                          remoteHistoryEntryClone.copyFrom(remoteHistoryEntry);
                          newHistory.push(remoteHistoryEntryClone);
                        }
                        remoteHistoryIx++;
                        continue;
                      }
                      if (this._editState && this._editState.added.indexOf(entryTime) >= 0) {
                        newHistory.push(historyEntry);
                      } else if (entryTime > remoteLastModTime) {
                        newHistory.push(historyEntry);
                      }
                      historyIx++;
                    }
                    return newHistory;
                  }
                  static create(meta, parentGroup) {
                    const entry = new KdbxEntry();
                    entry.uuid = kdbx_uuid_1.KdbxUuid.random();
                    entry.icon = consts_1.Icons.Key;
                    entry.times = kdbx_times_1.KdbxTimes.create();
                    entry.parentGroup = parentGroup;
                    entry.setField("Title", "", meta.memoryProtection.title);
                    entry.setField("UserName", meta.defaultUser || "", meta.memoryProtection.userName);
                    entry.setField("Password", "", meta.memoryProtection.password);
                    entry.setField("URL", "", meta.memoryProtection.url);
                    entry.setField("Notes", "", meta.memoryProtection.notes);
                    entry.autoType.enabled = typeof parentGroup.enableAutoType === "boolean" ? parentGroup.enableAutoType : true;
                    entry.autoType.obfuscation = consts_1.AutoTypeObfuscationOptions.None;
                    return entry;
                  }
                  static read(xmlNode, ctx, parentGroup) {
                    const entry = new KdbxEntry();
                    for (let i = 0, cn = xmlNode.childNodes, len = cn.length; i < len; i++) {
                      const childNode = cn[i];
                      if (childNode.tagName) {
                        entry.readNode(childNode, ctx);
                      }
                    }
                    if (entry.uuid.empty) {
                      entry.uuid = kdbx_uuid_1.KdbxUuid.random();
                      for (let j = 0; j < entry.history.length; j++) {
                        entry.history[j].uuid = entry.uuid;
                      }
                    }
                    entry.parentGroup = parentGroup;
                    return entry;
                  }
                }
                exports2.KdbxEntry = KdbxEntry;
              })
            ),
            /***/
            "./format/kdbx-format.ts": (
              /*!*******************************!*\
                !*** ./format/kdbx-format.ts ***!
                \*******************************/
              /***/
              ((__unused_webpack_module, exports2, __webpack_require__2) => {
                Object.defineProperty(exports2, "__esModule", { value: true });
                exports2.KdbxFormat = void 0;
                const fflate_1 = __webpack_require__2(
                  /*! fflate */
                  "../node_modules/fflate/lib/index.cjs"
                );
                const consts_1 = __webpack_require__2(
                  /*! ../defs/consts */
                  "./defs/consts.ts"
                );
                const kdbx_error_1 = __webpack_require__2(
                  /*! ../errors/kdbx-error */
                  "./errors/kdbx-error.ts"
                );
                const binary_stream_1 = __webpack_require__2(
                  /*! ../utils/binary-stream */
                  "./utils/binary-stream.ts"
                );
                const kdbx_context_1 = __webpack_require__2(
                  /*! ./kdbx-context */
                  "./format/kdbx-context.ts"
                );
                const kdbx_header_1 = __webpack_require__2(
                  /*! ./kdbx-header */
                  "./format/kdbx-header.ts"
                );
                const byte_utils_1 = __webpack_require__2(
                  /*! ../utils/byte-utils */
                  "./utils/byte-utils.ts"
                );
                const protect_salt_generator_1 = __webpack_require__2(
                  /*! ../crypto/protect-salt-generator */
                  "./crypto/protect-salt-generator.ts"
                );
                const XmlUtils = __webpack_require__2(
                  /*! ../utils/xml-utils */
                  "./utils/xml-utils.ts"
                );
                const HmacBlockTransform = __webpack_require__2(
                  /*! ../crypto/hmac-block-transform */
                  "./crypto/hmac-block-transform.ts"
                );
                const HashedBlockTransform = __webpack_require__2(
                  /*! ../crypto/hashed-block-transform */
                  "./crypto/hashed-block-transform.ts"
                );
                const CryptoEngine2 = __webpack_require__2(
                  /*! ../crypto/crypto-engine */
                  "./crypto/crypto-engine.ts"
                );
                const KeyEncryptorAes = __webpack_require__2(
                  /*! ../crypto/key-encryptor-aes */
                  "./crypto/key-encryptor-aes.ts"
                );
                const KeyEncryptorKdf = __webpack_require__2(
                  /*! ../crypto/key-encryptor-kdf */
                  "./crypto/key-encryptor-kdf.ts"
                );
                const int64_1 = __webpack_require__2(
                  /*! ../utils/int64 */
                  "./utils/int64.ts"
                );
                class KdbxFormat {
                  constructor(kdbx) {
                    this.preserveXml = false;
                    this.kdbx = kdbx;
                    this.ctx = new kdbx_context_1.KdbxContext({ kdbx });
                  }
                  load(data2) {
                    const stm = new binary_stream_1.BinaryStream(data2);
                    return this.kdbx.credentials.ready.then(() => {
                      this.kdbx.header = kdbx_header_1.KdbxHeader.read(stm, this.ctx);
                      if (this.kdbx.header.versionMajor === 3) {
                        return this.loadV3(stm);
                      } else if (this.kdbx.header.versionMajor === 4) {
                        return this.loadV4(stm);
                      } else {
                        throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.InvalidVersion, `bad version: ${this.kdbx.versionMajor}`);
                      }
                    });
                  }
                  loadV3(stm) {
                    return this.decryptXmlV3(stm).then((xmlStr) => {
                      this.kdbx.xml = XmlUtils.parse(xmlStr);
                      return this.setProtectedValues().then(() => {
                        return this.kdbx.loadFromXml(this.ctx).then(() => {
                          return this.checkHeaderHashV3(stm).then(() => {
                            this.cleanXml();
                            return this.kdbx;
                          });
                        });
                      });
                    });
                  }
                  loadV4(stm) {
                    return this.getHeaderHash(stm).then((headerSha) => {
                      const expectedHeaderSha = stm.readBytes(headerSha.byteLength);
                      if (!(0, byte_utils_1.arrayBufferEquals)(expectedHeaderSha, headerSha)) {
                        throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.FileCorrupt, "header hash mismatch");
                      }
                      return this.computeKeysV4().then((keys) => {
                        return this.getHeaderHmac(stm, keys.hmacKey).then((headerHmac) => {
                          const expectedHeaderHmac = stm.readBytes(headerHmac.byteLength);
                          if (!(0, byte_utils_1.arrayBufferEquals)(expectedHeaderHmac, headerHmac)) {
                            throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.InvalidKey);
                          }
                          return HmacBlockTransform.decrypt(stm.readBytesToEnd(), keys.hmacKey).then((data2) => {
                            (0, byte_utils_1.zeroBuffer)(keys.hmacKey);
                            return this.decryptData(data2, keys.cipherKey).then((data3) => {
                              (0, byte_utils_1.zeroBuffer)(keys.cipherKey);
                              if (this.kdbx.header.compression === consts_1.CompressionAlgorithm.GZip) {
                                data3 = (0, byte_utils_1.arrayToBuffer)((0, fflate_1.gunzipSync)(new Uint8Array(data3)));
                              }
                              stm = new binary_stream_1.BinaryStream((0, byte_utils_1.arrayToBuffer)(data3));
                              this.kdbx.header.readInnerHeader(stm, this.ctx);
                              data3 = stm.readBytesToEnd();
                              const xmlStr = (0, byte_utils_1.bytesToString)(data3);
                              this.kdbx.xml = XmlUtils.parse(xmlStr);
                              return this.setProtectedValues().then(() => {
                                return this.kdbx.loadFromXml(this.ctx).then((kdbx) => {
                                  this.cleanXml();
                                  return kdbx;
                                });
                              });
                            });
                          });
                        });
                      });
                    });
                  }
                  loadXml(xmlStr) {
                    return this.kdbx.credentials.ready.then(() => {
                      this.kdbx.header = kdbx_header_1.KdbxHeader.create();
                      this.kdbx.xml = XmlUtils.parse(xmlStr);
                      XmlUtils.protectPlainValues(this.kdbx.xml.documentElement);
                      return this.kdbx.loadFromXml(this.ctx).then(() => {
                        this.cleanXml();
                        return this.kdbx;
                      });
                    });
                  }
                  save() {
                    return this.kdbx.credentials.ready.then(() => {
                      const stm = new binary_stream_1.BinaryStream();
                      this.kdbx.header.generateSalts();
                      this.kdbx.header.write(stm);
                      if (this.kdbx.versionMajor === 3) {
                        return this.saveV3(stm);
                      } else if (this.kdbx.versionMajor === 4) {
                        return this.saveV4(stm);
                      } else {
                        throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.InvalidVersion, `bad version: ${this.kdbx.versionMajor}`);
                      }
                    });
                  }
                  saveV3(stm) {
                    return this.getHeaderHash(stm).then((headerHash) => {
                      this.kdbx.meta.headerHash = headerHash;
                      this.kdbx.buildXml(this.ctx);
                      return this.getProtectSaltGenerator().then((gen) => {
                        if (!this.kdbx.xml) {
                          throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.InvalidState, "no xml");
                        }
                        XmlUtils.updateProtectedValuesSalt(this.kdbx.xml.documentElement, gen);
                        return this.encryptXmlV3().then((data2) => {
                          this.cleanXml();
                          stm.writeBytes(data2);
                          return stm.getWrittenBytes();
                        });
                      });
                    });
                  }
                  saveV4(stm) {
                    this.kdbx.buildXml(this.ctx);
                    return this.getHeaderHash(stm).then((headerSha) => {
                      stm.writeBytes(headerSha);
                      return this.computeKeysV4().then((keys) => {
                        return this.getHeaderHmac(stm, keys.hmacKey).then((headerHmac) => {
                          stm.writeBytes(headerHmac);
                          return this.getProtectSaltGenerator().then((gen) => {
                            if (!this.kdbx.xml) {
                              throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.InvalidState, "no xml");
                            }
                            XmlUtils.updateProtectedValuesSalt(this.kdbx.xml.documentElement, gen);
                            const xml = XmlUtils.serialize(this.kdbx.xml);
                            const innerHeaderStm = new binary_stream_1.BinaryStream();
                            this.kdbx.header.writeInnerHeader(innerHeaderStm, this.ctx);
                            const innerHeaderData = innerHeaderStm.getWrittenBytes();
                            const xmlData = (0, byte_utils_1.arrayToBuffer)((0, byte_utils_1.stringToBytes)(xml));
                            let data2 = new ArrayBuffer(innerHeaderData.byteLength + xmlData.byteLength);
                            const dataArr = new Uint8Array(data2);
                            dataArr.set(new Uint8Array(innerHeaderData));
                            dataArr.set(new Uint8Array(xmlData), innerHeaderData.byteLength);
                            (0, byte_utils_1.zeroBuffer)(xmlData);
                            (0, byte_utils_1.zeroBuffer)(innerHeaderData);
                            if (this.kdbx.header.compression === consts_1.CompressionAlgorithm.GZip) {
                              data2 = (0, byte_utils_1.arrayToBuffer)((0, fflate_1.gzipSync)(new Uint8Array(data2)));
                            }
                            return this.encryptData((0, byte_utils_1.arrayToBuffer)(data2), keys.cipherKey).then((data3) => {
                              (0, byte_utils_1.zeroBuffer)(keys.cipherKey);
                              return HmacBlockTransform.encrypt(data3, keys.hmacKey).then((data4) => {
                                this.cleanXml();
                                (0, byte_utils_1.zeroBuffer)(keys.hmacKey);
                                stm.writeBytes(data4);
                                return stm.getWrittenBytes();
                              });
                            });
                          });
                        });
                      });
                    });
                  }
                  saveXml(prettyPrint = false) {
                    return this.kdbx.credentials.ready.then(() => {
                      this.kdbx.header.generateSalts();
                      this.ctx.exportXml = true;
                      this.kdbx.buildXml(this.ctx);
                      if (!this.kdbx.xml) {
                        throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.InvalidState, "no xml");
                      }
                      XmlUtils.unprotectValues(this.kdbx.xml.documentElement);
                      const xml = XmlUtils.serialize(this.kdbx.xml, prettyPrint);
                      XmlUtils.protectUnprotectedValues(this.kdbx.xml.documentElement);
                      this.cleanXml();
                      return xml;
                    });
                  }
                  decryptXmlV3(stm) {
                    const data2 = stm.readBytesToEnd();
                    return this.getMasterKeyV3().then((masterKey) => {
                      return this.decryptData(data2, masterKey).then((data3) => {
                        (0, byte_utils_1.zeroBuffer)(masterKey);
                        data3 = this.trimStartBytesV3(data3);
                        return HashedBlockTransform.decrypt(data3).then((data4) => {
                          if (this.kdbx.header.compression === consts_1.CompressionAlgorithm.GZip) {
                            data4 = (0, byte_utils_1.arrayToBuffer)((0, fflate_1.gunzipSync)(new Uint8Array(data4)));
                          }
                          return (0, byte_utils_1.bytesToString)(data4);
                        });
                      });
                    });
                  }
                  encryptXmlV3() {
                    if (!this.kdbx.xml) {
                      throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.InvalidState, "no xml");
                    }
                    const xml = XmlUtils.serialize(this.kdbx.xml);
                    let data2 = (0, byte_utils_1.arrayToBuffer)((0, byte_utils_1.stringToBytes)(xml));
                    if (this.kdbx.header.compression === consts_1.CompressionAlgorithm.GZip) {
                      data2 = (0, byte_utils_1.arrayToBuffer)((0, fflate_1.gzipSync)(new Uint8Array(data2)));
                    }
                    return HashedBlockTransform.encrypt((0, byte_utils_1.arrayToBuffer)(data2)).then((data3) => {
                      if (!this.kdbx.header.streamStartBytes) {
                        throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.InvalidState, "no header start bytes");
                      }
                      const ssb = new Uint8Array(this.kdbx.header.streamStartBytes);
                      const newData = new Uint8Array(data3.byteLength + ssb.length);
                      newData.set(ssb);
                      newData.set(new Uint8Array(data3), ssb.length);
                      data3 = newData;
                      return this.getMasterKeyV3().then((masterKey) => {
                        return this.encryptData((0, byte_utils_1.arrayToBuffer)(data3), masterKey).then((data4) => {
                          (0, byte_utils_1.zeroBuffer)(masterKey);
                          return data4;
                        });
                      });
                    });
                  }
                  getMasterKeyV3() {
                    return this.kdbx.credentials.getHash().then((credHash) => {
                      if (!this.kdbx.header.transformSeed || !this.kdbx.header.keyEncryptionRounds || !this.kdbx.header.masterSeed) {
                        throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.FileCorrupt, "no header transform parameters");
                      }
                      const transformSeed = this.kdbx.header.transformSeed;
                      const transformRounds = this.kdbx.header.keyEncryptionRounds;
                      const masterSeed = this.kdbx.header.masterSeed;
                      return this.kdbx.credentials.getChallengeResponse(masterSeed).then((chalResp) => {
                        return KeyEncryptorAes.encrypt(new Uint8Array(credHash), transformSeed, transformRounds).then((encKey) => {
                          (0, byte_utils_1.zeroBuffer)(credHash);
                          return CryptoEngine2.sha256(encKey).then((keyHash) => {
                            (0, byte_utils_1.zeroBuffer)(encKey);
                            const chalRespLength = chalResp ? chalResp.byteLength : 0;
                            const all = new Uint8Array(masterSeed.byteLength + keyHash.byteLength + chalRespLength);
                            all.set(new Uint8Array(masterSeed), 0);
                            if (chalResp) {
                              all.set(new Uint8Array(chalResp), masterSeed.byteLength);
                            }
                            all.set(new Uint8Array(keyHash), masterSeed.byteLength + chalRespLength);
                            (0, byte_utils_1.zeroBuffer)(keyHash);
                            (0, byte_utils_1.zeroBuffer)(masterSeed);
                            if (chalResp) {
                              (0, byte_utils_1.zeroBuffer)(chalResp);
                            }
                            return CryptoEngine2.sha256(all.buffer).then((masterKey) => {
                              (0, byte_utils_1.zeroBuffer)(all.buffer);
                              return masterKey;
                            });
                          });
                        });
                      });
                    });
                  }
                  trimStartBytesV3(data2) {
                    if (!this.kdbx.header.streamStartBytes) {
                      throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.FileCorrupt, "no stream start bytes");
                    }
                    const ssb = this.kdbx.header.streamStartBytes;
                    if (data2.byteLength < ssb.byteLength) {
                      throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.FileCorrupt, "short start bytes");
                    }
                    if (!(0, byte_utils_1.arrayBufferEquals)(data2.slice(0, this.kdbx.header.streamStartBytes.byteLength), ssb)) {
                      throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.InvalidKey);
                    }
                    return data2.slice(ssb.byteLength);
                  }
                  setProtectedValues() {
                    return this.getProtectSaltGenerator().then((gen) => {
                      if (!this.kdbx.xml) {
                        throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.InvalidState, "no xml");
                      }
                      XmlUtils.setProtectedValues(this.kdbx.xml.documentElement, gen);
                    });
                  }
                  getProtectSaltGenerator() {
                    if (!this.kdbx.header.protectedStreamKey || !this.kdbx.header.crsAlgorithm) {
                      throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.InvalidState, "bad header parameters");
                    }
                    return protect_salt_generator_1.ProtectSaltGenerator.create(this.kdbx.header.protectedStreamKey, this.kdbx.header.crsAlgorithm);
                  }
                  getHeaderHash(stm) {
                    if (!this.kdbx.header.endPos) {
                      throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.InvalidState, "no end pos");
                    }
                    const src = stm.readBytesNoAdvance(0, this.kdbx.header.endPos);
                    return CryptoEngine2.sha256(src);
                  }
                  getHeaderHmac(stm, key) {
                    if (!this.kdbx.header.endPos) {
                      throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.InvalidState, "no end pos");
                    }
                    const src = stm.readBytesNoAdvance(0, this.kdbx.header.endPos);
                    return HmacBlockTransform.getHmacKey(key, new int64_1.Int64(4294967295, 4294967295)).then((keySha) => {
                      return CryptoEngine2.hmacSha256(keySha, src);
                    });
                  }
                  checkHeaderHashV3(stm) {
                    if (this.kdbx.meta.headerHash) {
                      const metaHash = this.kdbx.meta.headerHash;
                      return this.getHeaderHash(stm).then((actualHash) => {
                        if (!(0, byte_utils_1.arrayBufferEquals)(metaHash, actualHash)) {
                          throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.FileCorrupt, "header hash mismatch");
                        }
                      });
                    } else {
                      return Promise.resolve();
                    }
                  }
                  computeKeysV4() {
                    const masterSeed = this.kdbx.header.masterSeed;
                    if (!masterSeed || masterSeed.byteLength !== 32) {
                      return Promise.reject(new kdbx_error_1.KdbxError(consts_1.ErrorCodes.FileCorrupt, "bad master seed"));
                    }
                    const kdfParams = this.kdbx.header.kdfParameters;
                    if (!kdfParams) {
                      throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.FileCorrupt, "no kdf params");
                    }
                    const kdfSalt = kdfParams.get("S");
                    if (!(kdfSalt instanceof ArrayBuffer)) {
                      throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.FileCorrupt, "no salt");
                    }
                    return this.kdbx.credentials.getHash(kdfSalt).then((credHash) => {
                      return KeyEncryptorKdf.encrypt(credHash, kdfParams).then((encKey) => {
                        (0, byte_utils_1.zeroBuffer)(credHash);
                        if (!encKey || encKey.byteLength !== 32) {
                          return Promise.reject(new kdbx_error_1.KdbxError(consts_1.ErrorCodes.Unsupported, "bad derived key"));
                        }
                        const keyWithSeed = new Uint8Array(65);
                        keyWithSeed.set(new Uint8Array(masterSeed), 0);
                        keyWithSeed.set(new Uint8Array(encKey), masterSeed.byteLength);
                        keyWithSeed[64] = 1;
                        (0, byte_utils_1.zeroBuffer)(encKey);
                        (0, byte_utils_1.zeroBuffer)(masterSeed);
                        return Promise.all([
                          CryptoEngine2.sha256(keyWithSeed.buffer.slice(0, 64)),
                          CryptoEngine2.sha512(keyWithSeed.buffer)
                        ]).then((keys) => {
                          (0, byte_utils_1.zeroBuffer)(keyWithSeed);
                          return { cipherKey: keys[0], hmacKey: keys[1] };
                        });
                      });
                    });
                  }
                  decryptData(data2, cipherKey) {
                    const cipherId = this.kdbx.header.dataCipherUuid;
                    if (!cipherId) {
                      throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.FileCorrupt, "no cipher id");
                    }
                    switch (cipherId.toString()) {
                      case consts_1.CipherId.Aes:
                        return this.transformDataV4Aes(data2, cipherKey, false);
                      case consts_1.CipherId.ChaCha20:
                        return this.transformDataV4ChaCha20(data2, cipherKey);
                      default:
                        return Promise.reject(new kdbx_error_1.KdbxError(consts_1.ErrorCodes.Unsupported, "unsupported cipher"));
                    }
                  }
                  encryptData(data2, cipherKey) {
                    const cipherId = this.kdbx.header.dataCipherUuid;
                    if (!cipherId) {
                      throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.FileCorrupt, "no cipher id");
                    }
                    switch (cipherId.toString()) {
                      case consts_1.CipherId.Aes:
                        return this.transformDataV4Aes(data2, cipherKey, true);
                      case consts_1.CipherId.ChaCha20:
                        return this.transformDataV4ChaCha20(data2, cipherKey);
                      default:
                        return Promise.reject(new kdbx_error_1.KdbxError(consts_1.ErrorCodes.Unsupported, "unsupported cipher"));
                    }
                  }
                  transformDataV4Aes(data2, cipherKey, encrypt) {
                    const aesCbc = CryptoEngine2.createAesCbc();
                    const iv = this.kdbx.header.encryptionIV;
                    if (!iv) {
                      throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.FileCorrupt, "no encryption IV");
                    }
                    return aesCbc.importKey(cipherKey).then(() => {
                      return encrypt ? aesCbc.encrypt(data2, iv) : aesCbc.decrypt(data2, iv);
                    });
                  }
                  transformDataV4ChaCha20(data2, cipherKey) {
                    const iv = this.kdbx.header.encryptionIV;
                    if (!iv) {
                      throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.FileCorrupt, "no encryption IV");
                    }
                    return CryptoEngine2.chacha20(data2, cipherKey, iv);
                  }
                  cleanXml() {
                    if (!this.preserveXml) {
                      this.kdbx.xml = void 0;
                    }
                  }
                }
                exports2.KdbxFormat = KdbxFormat;
              })
            ),
            /***/
            "./format/kdbx-group.ts": (
              /*!******************************!*\
                !*** ./format/kdbx-group.ts ***!
                \******************************/
              /***/
              ((__unused_webpack_module, exports2, __webpack_require__2) => {
                Object.defineProperty(exports2, "__esModule", { value: true });
                exports2.KdbxGroup = void 0;
                const XmlNames = __webpack_require__2(
                  /*! ./../defs/xml-names */
                  "./defs/xml-names.ts"
                );
                const XmlUtils = __webpack_require__2(
                  /*! ./../utils/xml-utils */
                  "./utils/xml-utils.ts"
                );
                const kdbx_times_1 = __webpack_require__2(
                  /*! ./kdbx-times */
                  "./format/kdbx-times.ts"
                );
                const kdbx_uuid_1 = __webpack_require__2(
                  /*! ./kdbx-uuid */
                  "./format/kdbx-uuid.ts"
                );
                const kdbx_entry_1 = __webpack_require__2(
                  /*! ./kdbx-entry */
                  "./format/kdbx-entry.ts"
                );
                const kdbx_custom_data_1 = __webpack_require__2(
                  /*! ./kdbx-custom-data */
                  "./format/kdbx-custom-data.ts"
                );
                const consts_1 = __webpack_require__2(
                  /*! ../defs/consts */
                  "./defs/consts.ts"
                );
                class KdbxGroup {
                  constructor() {
                    this.uuid = new kdbx_uuid_1.KdbxUuid();
                    this.tags = [];
                    this.times = new kdbx_times_1.KdbxTimes();
                    this.groups = [];
                    this.entries = [];
                  }
                  get lastModTime() {
                    var _a2, _b;
                    return (_b = (_a2 = this.times.lastModTime) === null || _a2 === void 0 ? void 0 : _a2.getTime()) !== null && _b !== void 0 ? _b : 0;
                  }
                  get locationChanged() {
                    var _a2, _b;
                    return (_b = (_a2 = this.times.locationChanged) === null || _a2 === void 0 ? void 0 : _a2.getTime()) !== null && _b !== void 0 ? _b : 0;
                  }
                  readNode(node, ctx) {
                    var _a2, _b;
                    switch (node.tagName) {
                      case XmlNames.Elem.Uuid:
                        this.uuid = (_a2 = XmlUtils.getUuid(node)) !== null && _a2 !== void 0 ? _a2 : new kdbx_uuid_1.KdbxUuid();
                        break;
                      case XmlNames.Elem.Name:
                        this.name = XmlUtils.getText(node);
                        break;
                      case XmlNames.Elem.Notes:
                        this.notes = XmlUtils.getText(node);
                        break;
                      case XmlNames.Elem.Icon:
                        this.icon = XmlUtils.getNumber(node);
                        break;
                      case XmlNames.Elem.CustomIconID:
                        this.customIcon = XmlUtils.getUuid(node);
                        break;
                      case XmlNames.Elem.Tags:
                        this.tags = XmlUtils.getTags(node);
                        break;
                      case XmlNames.Elem.Times:
                        this.times = kdbx_times_1.KdbxTimes.read(node);
                        break;
                      case XmlNames.Elem.IsExpanded:
                        this.expanded = (_b = XmlUtils.getBoolean(node)) !== null && _b !== void 0 ? _b : void 0;
                        break;
                      case XmlNames.Elem.GroupDefaultAutoTypeSeq:
                        this.defaultAutoTypeSeq = XmlUtils.getText(node);
                        break;
                      case XmlNames.Elem.EnableAutoType:
                        this.enableAutoType = XmlUtils.getBoolean(node);
                        break;
                      case XmlNames.Elem.EnableSearching:
                        this.enableSearching = XmlUtils.getBoolean(node);
                        break;
                      case XmlNames.Elem.LastTopVisibleEntry:
                        this.lastTopVisibleEntry = XmlUtils.getUuid(node);
                        break;
                      case XmlNames.Elem.Group:
                        this.groups.push(KdbxGroup.read(node, ctx, this));
                        break;
                      case XmlNames.Elem.Entry:
                        this.entries.push(kdbx_entry_1.KdbxEntry.read(node, ctx, this));
                        break;
                      case XmlNames.Elem.CustomData:
                        this.customData = kdbx_custom_data_1.KdbxCustomData.read(node);
                        break;
                      case XmlNames.Elem.PreviousParentGroup:
                        this.previousParentGroup = XmlUtils.getUuid(node);
                        break;
                    }
                  }
                  write(parentNode, ctx) {
                    const node = XmlUtils.addChildNode(parentNode, XmlNames.Elem.Group);
                    XmlUtils.setUuid(XmlUtils.addChildNode(node, XmlNames.Elem.Uuid), this.uuid);
                    XmlUtils.setText(XmlUtils.addChildNode(node, XmlNames.Elem.Name), this.name);
                    XmlUtils.setText(XmlUtils.addChildNode(node, XmlNames.Elem.Notes), this.notes);
                    XmlUtils.setNumber(XmlUtils.addChildNode(node, XmlNames.Elem.Icon), this.icon);
                    if (this.tags.length && ctx.kdbx.versionIsAtLeast(4, 1)) {
                      XmlUtils.setTags(XmlUtils.addChildNode(node, XmlNames.Elem.Tags), this.tags);
                    }
                    if (this.customIcon) {
                      XmlUtils.setUuid(XmlUtils.addChildNode(node, XmlNames.Elem.CustomIconID), this.customIcon);
                    }
                    if (this.previousParentGroup !== void 0 && ctx.kdbx.versionIsAtLeast(4, 1)) {
                      XmlUtils.setUuid(XmlUtils.addChildNode(node, XmlNames.Elem.PreviousParentGroup), this.previousParentGroup);
                    }
                    if (this.customData) {
                      kdbx_custom_data_1.KdbxCustomData.write(node, ctx, this.customData);
                    }
                    this.times.write(node, ctx);
                    XmlUtils.setBoolean(XmlUtils.addChildNode(node, XmlNames.Elem.IsExpanded), this.expanded);
                    XmlUtils.setText(XmlUtils.addChildNode(node, XmlNames.Elem.GroupDefaultAutoTypeSeq), this.defaultAutoTypeSeq);
                    XmlUtils.setBoolean(XmlUtils.addChildNode(node, XmlNames.Elem.EnableAutoType), this.enableAutoType);
                    XmlUtils.setBoolean(XmlUtils.addChildNode(node, XmlNames.Elem.EnableSearching), this.enableSearching);
                    XmlUtils.setUuid(XmlUtils.addChildNode(node, XmlNames.Elem.LastTopVisibleEntry), this.lastTopVisibleEntry);
                    for (const group of this.groups) {
                      group.write(node, ctx);
                    }
                    for (const entry of this.entries) {
                      entry.write(node, ctx);
                    }
                  }
                  *allGroups() {
                    yield this;
                    for (const group of this.groups) {
                      for (const g of group.allGroups()) {
                        yield g;
                      }
                    }
                  }
                  *allEntries() {
                    for (const group of this.allGroups()) {
                      for (const entry of group.entries) {
                        yield entry;
                      }
                    }
                  }
                  *allGroupsAndEntries() {
                    yield this;
                    for (const entry of this.entries) {
                      yield entry;
                    }
                    for (const group of this.groups) {
                      for (const item of group.allGroupsAndEntries()) {
                        yield item;
                      }
                    }
                  }
                  merge(objectMap) {
                    const remoteGroup = objectMap.remoteGroups.get(this.uuid.id);
                    if (!remoteGroup) {
                      return;
                    }
                    if (remoteGroup.lastModTime > this.lastModTime) {
                      this.copyFrom(remoteGroup);
                    }
                    this.groups = this.mergeCollection(this.groups, remoteGroup.groups, objectMap.groups, objectMap.remoteGroups, objectMap.deleted);
                    this.entries = this.mergeCollection(this.entries, remoteGroup.entries, objectMap.entries, objectMap.remoteEntries, objectMap.deleted);
                    for (const group of this.groups) {
                      group.merge(objectMap);
                    }
                    for (const entry of this.entries) {
                      entry.merge(objectMap);
                    }
                  }
                  /**
                   * Merge object collection with remote collection
                   * Implements 2P-set CRDT with tombstones stored in objectMap.deleted
                   * Assumes tombstones are already merged
                   */
                  mergeCollection(collection, remoteCollection, objectMapItems, remoteObjectMapItems, deletedObjects) {
                    const newItems = [];
                    for (const item of collection) {
                      if (!item.uuid || deletedObjects.has(item.uuid.id)) {
                        continue;
                      }
                      const remoteItem = remoteObjectMapItems.get(item.uuid.id);
                      if (!remoteItem) {
                        newItems.push(item);
                      } else if (remoteItem.locationChanged <= item.locationChanged) {
                        newItems.push(item);
                      }
                    }
                    let ix = -1;
                    for (const remoteItem of remoteCollection) {
                      ix++;
                      if (!remoteItem.uuid || deletedObjects.has(remoteItem.uuid.id)) {
                        continue;
                      }
                      const item = objectMapItems.get(remoteItem.uuid.id);
                      if (item && remoteItem.locationChanged > item.locationChanged) {
                        item.parentGroup = this;
                        newItems.splice(KdbxGroup.findInsertIx(newItems, remoteCollection, ix), 0, item);
                      } else if (!item) {
                        let newItem;
                        if (remoteItem instanceof KdbxGroup) {
                          const group = new KdbxGroup();
                          group.copyFrom(remoteItem);
                          newItem = group;
                        } else if (remoteItem instanceof kdbx_entry_1.KdbxEntry) {
                          const entry = new kdbx_entry_1.KdbxEntry();
                          entry.copyFrom(remoteItem);
                          newItem = entry;
                        } else {
                          continue;
                        }
                        newItem.parentGroup = this;
                        newItems.splice(KdbxGroup.findInsertIx(newItems, remoteCollection, ix), 0, newItem);
                      }
                    }
                    return newItems;
                  }
                  /**
                   * Finds a best place to insert new item into collection
                   */
                  static findInsertIx(dst, src, srcIx) {
                    let selectedIx = dst.length, selectedScore = -1;
                    for (let dstIx = 0; dstIx <= dst.length; dstIx++) {
                      let score = 0;
                      const srcPrev = srcIx > 0 ? src[srcIx - 1].uuid.id : void 0, srcNext = srcIx + 1 < src.length ? src[srcIx + 1].uuid.id : void 0, dstPrev = dstIx > 0 ? dst[dstIx - 1].uuid.id : void 0, dstNext = dstIx < dst.length ? dst[dstIx].uuid.id : void 0;
                      if (!srcPrev && !dstPrev) {
                        score += 1;
                      } else if (srcPrev === dstPrev) {
                        score += 5;
                      }
                      if (!srcNext && !dstNext) {
                        score += 2;
                      } else if (srcNext === dstNext) {
                        score += 5;
                      }
                      if (score > selectedScore) {
                        selectedIx = dstIx;
                        selectedScore = score;
                      }
                    }
                    return selectedIx;
                  }
                  copyFrom(group) {
                    this.uuid = group.uuid;
                    this.name = group.name;
                    this.notes = group.notes;
                    this.icon = group.icon;
                    this.customIcon = group.customIcon;
                    this.times = group.times.clone();
                    this.expanded = group.expanded;
                    this.defaultAutoTypeSeq = group.defaultAutoTypeSeq;
                    this.enableAutoType = group.enableAutoType;
                    this.enableSearching = group.enableSearching;
                    this.lastTopVisibleEntry = group.lastTopVisibleEntry;
                  }
                  static create(name2, parentGroup) {
                    const group = new KdbxGroup();
                    group.uuid = kdbx_uuid_1.KdbxUuid.random();
                    group.icon = consts_1.Icons.Folder;
                    group.times = kdbx_times_1.KdbxTimes.create();
                    group.name = name2;
                    group.parentGroup = parentGroup;
                    group.expanded = true;
                    group.enableAutoType = null;
                    group.enableSearching = null;
                    group.lastTopVisibleEntry = new kdbx_uuid_1.KdbxUuid();
                    return group;
                  }
                  static read(xmlNode, ctx, parentGroup) {
                    const grp = new KdbxGroup();
                    for (let i = 0, cn = xmlNode.childNodes, len = cn.length; i < len; i++) {
                      const childNode = cn[i];
                      if (childNode.tagName) {
                        grp.readNode(childNode, ctx);
                      }
                    }
                    if (grp.uuid.empty) {
                      grp.uuid = kdbx_uuid_1.KdbxUuid.random();
                    }
                    grp.parentGroup = parentGroup;
                    return grp;
                  }
                }
                exports2.KdbxGroup = KdbxGroup;
              })
            ),
            /***/
            "./format/kdbx-header.ts": (
              /*!*******************************!*\
                !*** ./format/kdbx-header.ts ***!
                \*******************************/
              /***/
              ((__unused_webpack_module, exports2, __webpack_require__2) => {
                Object.defineProperty(exports2, "__esModule", { value: true });
                exports2.KdbxHeader = void 0;
                const consts_1 = __webpack_require__2(
                  /*! ../defs/consts */
                  "./defs/consts.ts"
                );
                const kdbx_uuid_1 = __webpack_require__2(
                  /*! ./kdbx-uuid */
                  "./format/kdbx-uuid.ts"
                );
                const var_dictionary_1 = __webpack_require__2(
                  /*! ../utils/var-dictionary */
                  "./utils/var-dictionary.ts"
                );
                const binary_stream_1 = __webpack_require__2(
                  /*! ../utils/binary-stream */
                  "./utils/binary-stream.ts"
                );
                const kdbx_error_1 = __webpack_require__2(
                  /*! ../errors/kdbx-error */
                  "./errors/kdbx-error.ts"
                );
                const byte_utils_1 = __webpack_require__2(
                  /*! ../utils/byte-utils */
                  "./utils/byte-utils.ts"
                );
                const CryptoEngine2 = __webpack_require__2(
                  /*! ../crypto/crypto-engine */
                  "./crypto/crypto-engine.ts"
                );
                const int64_1 = __webpack_require__2(
                  /*! ../utils/int64 */
                  "./utils/int64.ts"
                );
                const protected_value_1 = __webpack_require__2(
                  /*! ../crypto/protected-value */
                  "./crypto/protected-value.ts"
                );
                const HeaderFields = [
                  { name: "EndOfHeader" },
                  { name: "Comment" },
                  { name: "CipherID" },
                  { name: "CompressionFlags" },
                  { name: "MasterSeed" },
                  { name: "TransformSeed", ver: [3] },
                  { name: "TransformRounds", ver: [3] },
                  { name: "EncryptionIV" },
                  { name: "ProtectedStreamKey", ver: [3] },
                  { name: "StreamStartBytes", ver: [3] },
                  { name: "InnerRandomStreamID", ver: [3] },
                  { name: "KdfParameters", ver: [4] },
                  { name: "PublicCustomData", ver: [4] }
                ];
                const InnerHeaderFields = [
                  { name: "EndOfHeader" },
                  { name: "InnerRandomStreamID" },
                  { name: "InnerRandomStreamKey" },
                  { name: "Binary", skipHeader: true }
                ];
                const HeaderConst = {
                  DefaultFileVersionMajor: 4,
                  MinSupportedVersion: 3,
                  MaxSupportedVersion: 4,
                  FlagBinaryProtected: 1,
                  InnerHeaderBinaryFieldId: 3,
                  DefaultKdfAlgo: consts_1.KdfId.Argon2d,
                  DefaultKdfSaltLength: 32,
                  DefaultKdfParallelism: 1,
                  DefaultKdfIterations: 2,
                  DefaultKdfMemory: 1024 * 1024,
                  DefaultKdfVersion: 19,
                  EndOfHeader: 13675786
                };
                const DefaultMinorVersions = {
                  3: 1,
                  4: 0
                };
                const LastMinorVersions = {
                  3: 1,
                  4: 1
                };
                class KdbxHeader {
                  constructor() {
                    this.versionMajor = 0;
                    this.versionMinor = 0;
                  }
                  readSignature(stm) {
                    if (stm.byteLength < 8) {
                      throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.FileCorrupt, "not enough data");
                    }
                    const sig1 = stm.getUint32(true), sig2 = stm.getUint32(true);
                    if (!(sig1 === consts_1.Signatures.FileMagic && sig2 === consts_1.Signatures.Sig2Kdbx)) {
                      throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.BadSignature);
                    }
                  }
                  writeSignature(stm) {
                    stm.setUint32(consts_1.Signatures.FileMagic, true);
                    stm.setUint32(consts_1.Signatures.Sig2Kdbx, true);
                  }
                  readVersion(stm) {
                    const versionMinor = stm.getUint16(true);
                    const versionMajor = stm.getUint16(true);
                    if (versionMajor > HeaderConst.MaxSupportedVersion || versionMajor < HeaderConst.MinSupportedVersion) {
                      throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.InvalidVersion);
                    }
                    if (versionMinor > LastMinorVersions[versionMajor]) {
                      throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.InvalidVersion);
                    }
                    this.versionMinor = versionMinor;
                    this.versionMajor = versionMajor;
                  }
                  writeVersion(stm) {
                    if (!this.versionMajor) {
                      throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.InvalidState, "version is not set");
                    }
                    stm.setUint16(this.versionMinor, true);
                    stm.setUint16(this.versionMajor, true);
                  }
                  readCipherID(bytes) {
                    if (bytes.byteLength !== 16) {
                      throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.Unsupported, "cipher");
                    }
                    this.dataCipherUuid = new kdbx_uuid_1.KdbxUuid(bytes);
                  }
                  writeCipherID(stm) {
                    if (!this.dataCipherUuid) {
                      throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.InvalidState, "cipher id is not set");
                    }
                    this.writeFieldSize(stm, 16);
                    stm.writeBytes(this.dataCipherUuid.bytes);
                  }
                  readCompressionFlags(bytes) {
                    const id = new DataView(bytes).getUint32(0, true);
                    if (id < 0 || id >= Object.keys(consts_1.CompressionAlgorithm).length) {
                      throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.Unsupported, "compression");
                    }
                    this.compression = id;
                  }
                  writeCompressionFlags(stm) {
                    if (typeof this.compression !== "number") {
                      throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.InvalidState, "compression is not set");
                    }
                    this.writeFieldSize(stm, 4);
                    stm.setUint32(this.compression, true);
                  }
                  readMasterSeed(bytes) {
                    this.masterSeed = bytes;
                  }
                  writeMasterSeed(stm) {
                    if (!this.masterSeed) {
                      throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.InvalidState, "master seed is not set");
                    }
                    this.writeFieldBytes(stm, this.masterSeed);
                  }
                  readTransformSeed(bytes) {
                    this.transformSeed = bytes;
                  }
                  writeTransformSeed(stm) {
                    if (!this.transformSeed) {
                      throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.InvalidState, "transform seed is not set");
                    }
                    this.writeFieldBytes(stm, this.transformSeed);
                  }
                  readTransformRounds(bytes) {
                    this.keyEncryptionRounds = new binary_stream_1.BinaryStream(bytes).getUint64(true);
                  }
                  writeTransformRounds(stm) {
                    if (!this.keyEncryptionRounds) {
                      throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.InvalidState, "key encryption rounds is not set");
                    }
                    this.writeFieldSize(stm, 8);
                    stm.setUint64(this.keyEncryptionRounds, true);
                  }
                  readEncryptionIV(bytes) {
                    this.encryptionIV = bytes;
                  }
                  writeEncryptionIV(stm) {
                    if (!this.encryptionIV) {
                      throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.InvalidState, "encryption IV is not set");
                    }
                    this.writeFieldBytes(stm, this.encryptionIV);
                  }
                  readProtectedStreamKey(bytes) {
                    this.protectedStreamKey = bytes;
                  }
                  writeProtectedStreamKey(stm) {
                    if (!this.protectedStreamKey) {
                      throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.InvalidState, "protected stream key is not set");
                    }
                    this.writeFieldBytes(stm, this.protectedStreamKey);
                  }
                  readStreamStartBytes(bytes) {
                    this.streamStartBytes = bytes;
                  }
                  writeStreamStartBytes(stm) {
                    if (!this.streamStartBytes) {
                      throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.InvalidState, "stream start bytes is not set");
                    }
                    this.writeFieldBytes(stm, this.streamStartBytes);
                  }
                  readInnerRandomStreamID(bytes) {
                    this.crsAlgorithm = new DataView(bytes).getUint32(0, true);
                  }
                  writeInnerRandomStreamID(stm) {
                    if (!this.crsAlgorithm) {
                      throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.InvalidState, "CRSAlgorithm is not set");
                    }
                    this.writeFieldSize(stm, 4);
                    stm.setUint32(this.crsAlgorithm, true);
                  }
                  readInnerRandomStreamKey(bytes) {
                    this.protectedStreamKey = bytes;
                  }
                  writeInnerRandomStreamKey(stm) {
                    if (!this.protectedStreamKey) {
                      throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.InvalidState, "protected stream key is not set");
                    }
                    this.writeFieldBytes(stm, this.protectedStreamKey);
                  }
                  readKdfParameters(bytes) {
                    this.kdfParameters = var_dictionary_1.VarDictionary.read(new binary_stream_1.BinaryStream(bytes));
                  }
                  writeKdfParameters(stm) {
                    if (!this.kdfParameters) {
                      throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.InvalidState, "KDF parameters are not set");
                    }
                    const innerStream = new binary_stream_1.BinaryStream();
                    this.kdfParameters.write(innerStream);
                    this.writeFieldBytes(stm, innerStream.getWrittenBytes());
                  }
                  readPublicCustomData(bytes) {
                    this.publicCustomData = var_dictionary_1.VarDictionary.read(new binary_stream_1.BinaryStream(bytes));
                  }
                  hasPublicCustomData() {
                    return !!this.publicCustomData;
                  }
                  writePublicCustomData(stm) {
                    if (this.publicCustomData) {
                      const innerStream = new binary_stream_1.BinaryStream();
                      this.publicCustomData.write(innerStream);
                      this.writeFieldBytes(stm, innerStream.getWrittenBytes());
                    }
                  }
                  readBinary(bytes, ctx) {
                    const view = new DataView(bytes);
                    const flags = view.getUint8(0);
                    const isProtected = flags & HeaderConst.FlagBinaryProtected;
                    const binaryData = bytes.slice(1);
                    const binary = isProtected ? protected_value_1.ProtectedValue.fromBinary(binaryData) : binaryData;
                    ctx.kdbx.binaries.addWithNextId(binary);
                  }
                  writeBinary(stm, ctx) {
                    if (this.versionMajor < 4) {
                      return;
                    }
                    const binaries = ctx.kdbx.binaries.getAll();
                    for (const binary of binaries) {
                      stm.setUint8(HeaderConst.InnerHeaderBinaryFieldId);
                      if (binary.value instanceof protected_value_1.ProtectedValue) {
                        const binaryData = binary.value.getBinary();
                        this.writeFieldSize(stm, binaryData.byteLength + 1);
                        stm.setUint8(HeaderConst.FlagBinaryProtected);
                        stm.writeBytes(binaryData);
                        (0, byte_utils_1.zeroBuffer)(binaryData);
                      } else {
                        this.writeFieldSize(stm, binary.value.byteLength + 1);
                        stm.setUint8(0);
                        stm.writeBytes(binary.value);
                      }
                    }
                  }
                  writeEndOfHeader(stm) {
                    this.writeFieldSize(stm, 4);
                    stm.setUint32(HeaderConst.EndOfHeader, false);
                  }
                  readField(stm, fields, ctx) {
                    const headerId = stm.getUint8();
                    const size = this.readFieldSize(stm);
                    const bytes = size > 0 ? stm.readBytes(size) : new ArrayBuffer(0);
                    const headerField = fields[headerId];
                    switch (headerField.name) {
                      case "EndOfHeader":
                      case "Comment":
                        break;
                      case "CipherID":
                        this.readCipherID(bytes);
                        break;
                      case "CompressionFlags":
                        this.readCompressionFlags(bytes);
                        break;
                      case "MasterSeed":
                        this.readMasterSeed(bytes);
                        break;
                      case "TransformSeed":
                        this.readTransformSeed(bytes);
                        break;
                      case "TransformRounds":
                        this.readTransformRounds(bytes);
                        break;
                      case "EncryptionIV":
                        this.readEncryptionIV(bytes);
                        break;
                      case "ProtectedStreamKey":
                        this.readProtectedStreamKey(bytes);
                        break;
                      case "StreamStartBytes":
                        this.readStreamStartBytes(bytes);
                        break;
                      case "InnerRandomStreamID":
                        this.readInnerRandomStreamID(bytes);
                        break;
                      case "KdfParameters":
                        this.readKdfParameters(bytes);
                        break;
                      case "PublicCustomData":
                        this.readPublicCustomData(bytes);
                        break;
                      case "InnerRandomStreamKey":
                        this.readInnerRandomStreamKey(bytes);
                        break;
                      case "Binary":
                        this.readBinary(bytes, ctx);
                        break;
                      default:
                        throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.InvalidArg, `bad header field: ${headerField.name}`);
                    }
                    return headerId !== 0;
                  }
                  writeField(stm, headerId, fields, ctx) {
                    const headerField = fields[headerId];
                    if (headerField) {
                      if (headerField.ver && !headerField.ver.includes(this.versionMajor)) {
                        return;
                      }
                      switch (headerField.name) {
                        case "PublicCustomData":
                          if (!this.hasPublicCustomData()) {
                            return;
                          }
                          break;
                        case "Comment":
                          return;
                      }
                      if (!headerField.skipHeader) {
                        stm.setUint8(headerId);
                      }
                      switch (headerField.name) {
                        case "EndOfHeader":
                          this.writeEndOfHeader(stm);
                          break;
                        case "CipherID":
                          this.writeCipherID(stm);
                          break;
                        case "CompressionFlags":
                          this.writeCompressionFlags(stm);
                          break;
                        case "MasterSeed":
                          this.writeMasterSeed(stm);
                          break;
                        case "TransformSeed":
                          this.writeTransformSeed(stm);
                          break;
                        case "TransformRounds":
                          this.writeTransformRounds(stm);
                          break;
                        case "EncryptionIV":
                          this.writeEncryptionIV(stm);
                          break;
                        case "ProtectedStreamKey":
                          this.writeProtectedStreamKey(stm);
                          break;
                        case "StreamStartBytes":
                          this.writeStreamStartBytes(stm);
                          break;
                        case "InnerRandomStreamID":
                          this.writeInnerRandomStreamID(stm);
                          break;
                        case "KdfParameters":
                          this.writeKdfParameters(stm);
                          break;
                        case "PublicCustomData":
                          this.writePublicCustomData(stm);
                          break;
                        case "InnerRandomStreamKey":
                          this.writeInnerRandomStreamKey(stm);
                          break;
                        case "Binary":
                          if (!ctx) {
                            throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.InvalidArg, "context is not set");
                          }
                          this.writeBinary(stm, ctx);
                          break;
                        default:
                          throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.InvalidArg, `Bad header field: ${headerField.name}`);
                      }
                    }
                  }
                  readFieldSize(stm) {
                    return (this.versionMajor | 0) >= 4 ? stm.getUint32(true) : stm.getUint16(true);
                  }
                  writeFieldSize(stm, size) {
                    if ((this.versionMajor | 0) >= 4) {
                      stm.setUint32(size, true);
                    } else {
                      stm.setUint16(size, true);
                    }
                  }
                  writeFieldBytes(stm, bytes) {
                    this.writeFieldSize(stm, bytes.byteLength);
                    stm.writeBytes(bytes);
                  }
                  validate() {
                    if (!this.versionMajor || this.versionMinor === void 0) {
                      throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.FileCorrupt, "no version in header");
                    }
                    if (this.dataCipherUuid === void 0) {
                      throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.FileCorrupt, "no cipher in header");
                    }
                    if (this.compression === void 0) {
                      throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.FileCorrupt, "no compression in header");
                    }
                    if (!this.masterSeed) {
                      throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.FileCorrupt, "no master seed in header");
                    }
                    if (this.versionMajor < 4 && !this.transformSeed) {
                      throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.FileCorrupt, "no transform seed in header");
                    }
                    if (this.versionMajor < 4 && !this.keyEncryptionRounds) {
                      throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.FileCorrupt, "no key encryption rounds in header");
                    }
                    if (!this.encryptionIV) {
                      throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.FileCorrupt, "no encryption iv in header");
                    }
                    if (this.versionMajor < 4 && !this.protectedStreamKey) {
                      throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.FileCorrupt, "no protected stream key in header");
                    }
                    if (this.versionMajor < 4 && !this.streamStartBytes) {
                      throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.FileCorrupt, "no stream start bytes in header");
                    }
                    if (this.versionMajor < 4 && !this.crsAlgorithm) {
                      throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.FileCorrupt, "no crs algorithm in header");
                    }
                    if (this.versionMajor >= 4 && !this.kdfParameters) {
                      throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.FileCorrupt, "no kdf parameters in header");
                    }
                  }
                  validateInner() {
                    if (!this.protectedStreamKey) {
                      throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.FileCorrupt, "no protected stream key in header");
                    }
                    if (!this.crsAlgorithm) {
                      throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.FileCorrupt, "no crs algorithm in header");
                    }
                  }
                  createKdfParameters(algo) {
                    if (!algo) {
                      algo = HeaderConst.DefaultKdfAlgo;
                    }
                    switch (algo) {
                      case consts_1.KdfId.Argon2d:
                      case consts_1.KdfId.Argon2id:
                        this.kdfParameters = new var_dictionary_1.VarDictionary();
                        this.kdfParameters.set("$UUID", var_dictionary_1.ValueType.Bytes, (0, byte_utils_1.base64ToBytes)(algo));
                        this.kdfParameters.set("S", var_dictionary_1.ValueType.Bytes, CryptoEngine2.random(HeaderConst.DefaultKdfSaltLength));
                        this.kdfParameters.set("P", var_dictionary_1.ValueType.UInt32, HeaderConst.DefaultKdfParallelism);
                        this.kdfParameters.set("I", var_dictionary_1.ValueType.UInt64, new int64_1.Int64(HeaderConst.DefaultKdfIterations));
                        this.kdfParameters.set("M", var_dictionary_1.ValueType.UInt64, new int64_1.Int64(HeaderConst.DefaultKdfMemory));
                        this.kdfParameters.set("V", var_dictionary_1.ValueType.UInt32, HeaderConst.DefaultKdfVersion);
                        break;
                      case consts_1.KdfId.Aes:
                        this.kdfParameters = new var_dictionary_1.VarDictionary();
                        this.kdfParameters.set("$UUID", var_dictionary_1.ValueType.Bytes, (0, byte_utils_1.base64ToBytes)(consts_1.KdfId.Aes));
                        this.kdfParameters.set("S", var_dictionary_1.ValueType.Bytes, CryptoEngine2.random(HeaderConst.DefaultKdfSaltLength));
                        this.kdfParameters.set("R", var_dictionary_1.ValueType.UInt64, new int64_1.Int64(consts_1.Defaults.KeyEncryptionRounds));
                        break;
                      default:
                        throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.InvalidArg, "bad KDF algo");
                    }
                  }
                  write(stm) {
                    this.validate();
                    this.writeSignature(stm);
                    this.writeVersion(stm);
                    for (let id = 1; id < HeaderFields.length; id++) {
                      this.writeField(stm, id, HeaderFields);
                    }
                    this.writeField(stm, 0, HeaderFields);
                    this.endPos = stm.pos;
                  }
                  writeInnerHeader(stm, ctx) {
                    this.validateInner();
                    for (let id = 1; id < InnerHeaderFields.length; id++) {
                      this.writeField(stm, id, InnerHeaderFields, ctx);
                    }
                    this.writeField(stm, 0, InnerHeaderFields, ctx);
                  }
                  generateSalts() {
                    this.masterSeed = CryptoEngine2.random(32);
                    if (this.versionMajor < 4) {
                      this.transformSeed = CryptoEngine2.random(32);
                      this.streamStartBytes = CryptoEngine2.random(32);
                      this.protectedStreamKey = CryptoEngine2.random(32);
                      this.encryptionIV = CryptoEngine2.random(16);
                    } else {
                      this.protectedStreamKey = CryptoEngine2.random(64);
                      if (!this.kdfParameters || !this.dataCipherUuid) {
                        throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.InvalidState, "no kdf params");
                      }
                      this.kdfParameters.set("S", var_dictionary_1.ValueType.Bytes, CryptoEngine2.random(32));
                      const ivLength = this.dataCipherUuid.toString() === consts_1.CipherId.ChaCha20 ? 12 : 16;
                      this.encryptionIV = CryptoEngine2.random(ivLength);
                    }
                  }
                  setVersion(version2) {
                    if (version2 !== 3 && version2 !== 4) {
                      throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.InvalidArg, "bad file version");
                    }
                    this.versionMajor = version2;
                    this.versionMinor = DefaultMinorVersions[version2];
                    if (this.versionMajor === 4) {
                      if (!this.kdfParameters) {
                        this.createKdfParameters();
                      }
                      this.crsAlgorithm = consts_1.CrsAlgorithm.ChaCha20;
                      this.keyEncryptionRounds = void 0;
                    } else {
                      this.kdfParameters = void 0;
                      this.crsAlgorithm = consts_1.CrsAlgorithm.Salsa20;
                      this.keyEncryptionRounds = consts_1.Defaults.KeyEncryptionRounds;
                    }
                  }
                  setKdf(kdf) {
                    this.createKdfParameters(kdf);
                  }
                  static read(stm, ctx) {
                    const header = new KdbxHeader();
                    header.readSignature(stm);
                    header.readVersion(stm);
                    while (header.readField(stm, HeaderFields, ctx)) {
                    }
                    header.endPos = stm.pos;
                    header.validate();
                    return header;
                  }
                  readInnerHeader(stm, ctx) {
                    while (this.readField(stm, InnerHeaderFields, ctx)) {
                    }
                    this.validateInner();
                  }
                  static create() {
                    const header = new KdbxHeader();
                    header.versionMajor = HeaderConst.DefaultFileVersionMajor;
                    header.versionMinor = DefaultMinorVersions[HeaderConst.DefaultFileVersionMajor];
                    header.dataCipherUuid = new kdbx_uuid_1.KdbxUuid(consts_1.CipherId.Aes);
                    header.compression = consts_1.CompressionAlgorithm.GZip;
                    header.crsAlgorithm = consts_1.CrsAlgorithm.ChaCha20;
                    header.createKdfParameters();
                    return header;
                  }
                }
                exports2.KdbxHeader = KdbxHeader;
                KdbxHeader.MaxFileVersion = HeaderConst.MaxSupportedVersion;
              })
            ),
            /***/
            "./format/kdbx-meta.ts": (
              /*!*****************************!*\
                !*** ./format/kdbx-meta.ts ***!
                \*****************************/
              /***/
              ((__unused_webpack_module, exports2, __webpack_require__2) => {
                Object.defineProperty(exports2, "__esModule", { value: true });
                exports2.KdbxMeta = void 0;
                const kdbx_uuid_1 = __webpack_require__2(
                  /*! ./kdbx-uuid */
                  "./format/kdbx-uuid.ts"
                );
                const XmlUtils = __webpack_require__2(
                  /*! ../utils/xml-utils */
                  "./utils/xml-utils.ts"
                );
                const XmlNames = __webpack_require__2(
                  /*! ../defs/xml-names */
                  "./defs/xml-names.ts"
                );
                const kdbx_custom_data_1 = __webpack_require__2(
                  /*! ./kdbx-custom-data */
                  "./format/kdbx-custom-data.ts"
                );
                const kdbx_error_1 = __webpack_require__2(
                  /*! ../errors/kdbx-error */
                  "./errors/kdbx-error.ts"
                );
                const consts_1 = __webpack_require__2(
                  /*! ../defs/consts */
                  "./defs/consts.ts"
                );
                const kdbx_binaries_1 = __webpack_require__2(
                  /*! ./kdbx-binaries */
                  "./format/kdbx-binaries.ts"
                );
                const MetaConst = {
                  Generator: "KdbxWeb"
                };
                class KdbxMeta {
                  constructor() {
                    this._memoryProtection = {};
                    this.customData = /* @__PURE__ */ new Map();
                    this.customIcons = /* @__PURE__ */ new Map();
                  }
                  get editState() {
                    return this._editState;
                  }
                  set editState(value) {
                    this._editState = value;
                  }
                  getOrCreateEditState() {
                    if (!this._editState) {
                      this._editState = {};
                    }
                    return this._editState;
                  }
                  get name() {
                    return this._name;
                  }
                  set name(value) {
                    if (value !== this._name) {
                      this._name = value;
                      this.nameChanged = /* @__PURE__ */ new Date();
                    }
                  }
                  get desc() {
                    return this._desc;
                  }
                  set desc(value) {
                    if (value !== this._desc) {
                      this._desc = value;
                      this.descChanged = /* @__PURE__ */ new Date();
                    }
                  }
                  get defaultUser() {
                    return this._defaultUser;
                  }
                  set defaultUser(value) {
                    if (value !== this._defaultUser) {
                      this._defaultUser = value;
                      this.defaultUserChanged = /* @__PURE__ */ new Date();
                    }
                  }
                  get mntncHistoryDays() {
                    return this._mntncHistoryDays;
                  }
                  set mntncHistoryDays(value) {
                    if (value !== this._mntncHistoryDays) {
                      this._mntncHistoryDays = value;
                      this.getOrCreateEditState().mntncHistoryDaysChanged = /* @__PURE__ */ new Date();
                    }
                  }
                  get color() {
                    return this._color;
                  }
                  set color(value) {
                    if (value !== this._color) {
                      this._color = value;
                      this.getOrCreateEditState().colorChanged = /* @__PURE__ */ new Date();
                    }
                  }
                  get keyChangeRec() {
                    return this._keyChangeRec;
                  }
                  set keyChangeRec(value) {
                    if (value !== this._keyChangeRec) {
                      this._keyChangeRec = value;
                      this.getOrCreateEditState().keyChangeRecChanged = /* @__PURE__ */ new Date();
                    }
                  }
                  get keyChangeForce() {
                    return this._keyChangeForce;
                  }
                  set keyChangeForce(value) {
                    if (value !== this._keyChangeForce) {
                      this._keyChangeForce = value;
                      this.getOrCreateEditState().keyChangeForceChanged = /* @__PURE__ */ new Date();
                    }
                  }
                  get recycleBinEnabled() {
                    return this._recycleBinEnabled;
                  }
                  set recycleBinEnabled(value) {
                    if (value !== this._recycleBinEnabled) {
                      this._recycleBinEnabled = value;
                      this.recycleBinChanged = /* @__PURE__ */ new Date();
                    }
                  }
                  get recycleBinUuid() {
                    return this._recycleBinUuid;
                  }
                  set recycleBinUuid(value) {
                    if (value !== this._recycleBinUuid) {
                      this._recycleBinUuid = value;
                      this.recycleBinChanged = /* @__PURE__ */ new Date();
                    }
                  }
                  get entryTemplatesGroup() {
                    return this._entryTemplatesGroup;
                  }
                  set entryTemplatesGroup(value) {
                    if (value !== this._entryTemplatesGroup) {
                      this._entryTemplatesGroup = value;
                      this.entryTemplatesGroupChanged = /* @__PURE__ */ new Date();
                    }
                  }
                  get historyMaxItems() {
                    return this._historyMaxItems;
                  }
                  set historyMaxItems(value) {
                    if (value !== this._historyMaxItems) {
                      this._historyMaxItems = value;
                      this.getOrCreateEditState().historyMaxItemsChanged = /* @__PURE__ */ new Date();
                    }
                  }
                  get historyMaxSize() {
                    return this._historyMaxSize;
                  }
                  set historyMaxSize(value) {
                    if (value !== this._historyMaxSize) {
                      this._historyMaxSize = value;
                      this.getOrCreateEditState().historyMaxSizeChanged = /* @__PURE__ */ new Date();
                    }
                  }
                  get lastSelectedGroup() {
                    return this._lastSelectedGroup;
                  }
                  set lastSelectedGroup(value) {
                    if (value !== this._lastSelectedGroup) {
                      this._lastSelectedGroup = value;
                      this.getOrCreateEditState().lastSelectedGroupChanged = /* @__PURE__ */ new Date();
                    }
                  }
                  get lastTopVisibleGroup() {
                    return this._lastTopVisibleGroup;
                  }
                  set lastTopVisibleGroup(value) {
                    if (value !== this._lastTopVisibleGroup) {
                      this._lastTopVisibleGroup = value;
                      this.getOrCreateEditState().lastTopVisibleGroupChanged = /* @__PURE__ */ new Date();
                    }
                  }
                  get memoryProtection() {
                    return this._memoryProtection;
                  }
                  set memoryProtection(value) {
                    if (value !== this._memoryProtection) {
                      this._memoryProtection = value;
                      this.getOrCreateEditState().memoryProtectionChanged = /* @__PURE__ */ new Date();
                    }
                  }
                  readNode(node, ctx) {
                    var _a2;
                    switch (node.tagName) {
                      case XmlNames.Elem.Generator:
                        this.generator = XmlUtils.getText(node);
                        break;
                      case XmlNames.Elem.HeaderHash:
                        this.headerHash = XmlUtils.getBytes(node);
                        break;
                      case XmlNames.Elem.SettingsChanged:
                        this.settingsChanged = XmlUtils.getDate(node);
                        break;
                      case XmlNames.Elem.DbName:
                        this._name = XmlUtils.getText(node);
                        break;
                      case XmlNames.Elem.DbNameChanged:
                        this.nameChanged = XmlUtils.getDate(node);
                        break;
                      case XmlNames.Elem.DbDesc:
                        this._desc = XmlUtils.getText(node);
                        break;
                      case XmlNames.Elem.DbDescChanged:
                        this.descChanged = XmlUtils.getDate(node);
                        break;
                      case XmlNames.Elem.DbDefaultUser:
                        this._defaultUser = XmlUtils.getText(node);
                        break;
                      case XmlNames.Elem.DbDefaultUserChanged:
                        this.defaultUserChanged = XmlUtils.getDate(node);
                        break;
                      case XmlNames.Elem.DbMntncHistoryDays:
                        this._mntncHistoryDays = XmlUtils.getNumber(node);
                        break;
                      case XmlNames.Elem.DbColor:
                        this._color = XmlUtils.getText(node);
                        break;
                      case XmlNames.Elem.DbKeyChanged:
                        this.keyChanged = XmlUtils.getDate(node);
                        break;
                      case XmlNames.Elem.DbKeyChangeRec:
                        this._keyChangeRec = XmlUtils.getNumber(node);
                        break;
                      case XmlNames.Elem.DbKeyChangeForce:
                        this._keyChangeForce = XmlUtils.getNumber(node);
                        break;
                      case XmlNames.Elem.RecycleBinEnabled:
                        this._recycleBinEnabled = (_a2 = XmlUtils.getBoolean(node)) !== null && _a2 !== void 0 ? _a2 : void 0;
                        break;
                      case XmlNames.Elem.RecycleBinUuid:
                        this._recycleBinUuid = XmlUtils.getUuid(node);
                        break;
                      case XmlNames.Elem.RecycleBinChanged:
                        this.recycleBinChanged = XmlUtils.getDate(node);
                        break;
                      case XmlNames.Elem.EntryTemplatesGroup:
                        this._entryTemplatesGroup = XmlUtils.getUuid(node);
                        break;
                      case XmlNames.Elem.EntryTemplatesGroupChanged:
                        this.entryTemplatesGroupChanged = XmlUtils.getDate(node);
                        break;
                      case XmlNames.Elem.HistoryMaxItems:
                        this._historyMaxItems = XmlUtils.getNumber(node);
                        break;
                      case XmlNames.Elem.HistoryMaxSize:
                        this._historyMaxSize = XmlUtils.getNumber(node);
                        break;
                      case XmlNames.Elem.LastSelectedGroup:
                        this._lastSelectedGroup = XmlUtils.getUuid(node);
                        break;
                      case XmlNames.Elem.LastTopVisibleGroup:
                        this._lastTopVisibleGroup = XmlUtils.getUuid(node);
                        break;
                      case XmlNames.Elem.MemoryProt:
                        this.readMemoryProtection(node);
                        break;
                      case XmlNames.Elem.CustomIcons:
                        this.readCustomIcons(node);
                        break;
                      case XmlNames.Elem.Binaries:
                        this.readBinaries(node, ctx);
                        break;
                      case XmlNames.Elem.CustomData:
                        this.readCustomData(node);
                        break;
                    }
                  }
                  readMemoryProtection(node) {
                    var _a2, _b, _c, _d, _e;
                    for (let i = 0, cn = node.childNodes, len = cn.length; i < len; i++) {
                      const childNode = cn[i];
                      switch (childNode.tagName) {
                        case XmlNames.Elem.ProtTitle:
                          this.memoryProtection.title = (_a2 = XmlUtils.getBoolean(childNode)) !== null && _a2 !== void 0 ? _a2 : void 0;
                          break;
                        case XmlNames.Elem.ProtUserName:
                          this.memoryProtection.userName = (_b = XmlUtils.getBoolean(childNode)) !== null && _b !== void 0 ? _b : void 0;
                          break;
                        case XmlNames.Elem.ProtPassword:
                          this.memoryProtection.password = (_c = XmlUtils.getBoolean(childNode)) !== null && _c !== void 0 ? _c : void 0;
                          break;
                        case XmlNames.Elem.ProtUrl:
                          this.memoryProtection.url = (_d = XmlUtils.getBoolean(childNode)) !== null && _d !== void 0 ? _d : void 0;
                          break;
                        case XmlNames.Elem.ProtNotes:
                          this.memoryProtection.notes = (_e = XmlUtils.getBoolean(childNode)) !== null && _e !== void 0 ? _e : void 0;
                          break;
                      }
                    }
                  }
                  writeMemoryProtection(parentNode) {
                    const node = XmlUtils.addChildNode(parentNode, XmlNames.Elem.MemoryProt);
                    XmlUtils.setBoolean(XmlUtils.addChildNode(node, XmlNames.Elem.ProtTitle), this.memoryProtection.title);
                    XmlUtils.setBoolean(XmlUtils.addChildNode(node, XmlNames.Elem.ProtUserName), this.memoryProtection.userName);
                    XmlUtils.setBoolean(XmlUtils.addChildNode(node, XmlNames.Elem.ProtPassword), this.memoryProtection.password);
                    XmlUtils.setBoolean(XmlUtils.addChildNode(node, XmlNames.Elem.ProtUrl), this.memoryProtection.url);
                    XmlUtils.setBoolean(XmlUtils.addChildNode(node, XmlNames.Elem.ProtNotes), this.memoryProtection.notes);
                  }
                  readCustomIcons(node) {
                    for (let i = 0, cn = node.childNodes, len = cn.length; i < len; i++) {
                      const childNode = cn[i];
                      if (childNode.tagName === XmlNames.Elem.CustomIconItem) {
                        this.readCustomIcon(childNode);
                      }
                    }
                  }
                  readCustomIcon(node) {
                    var _a2;
                    let uuid, data2, name2, lastModified;
                    for (let i = 0, cn = node.childNodes, len = cn.length; i < len; i++) {
                      const childNode = cn[i];
                      switch (childNode.tagName) {
                        case XmlNames.Elem.CustomIconItemID:
                          uuid = XmlUtils.getUuid(childNode);
                          break;
                        case XmlNames.Elem.CustomIconItemData:
                          data2 = XmlUtils.getBytes(childNode);
                          break;
                        case XmlNames.Elem.CustomIconItemName:
                          name2 = (_a2 = XmlUtils.getText(childNode)) !== null && _a2 !== void 0 ? _a2 : void 0;
                          break;
                        case XmlNames.Elem.LastModTime:
                          lastModified = XmlUtils.getDate(childNode);
                          break;
                      }
                    }
                    if (uuid && data2) {
                      this.customIcons.set(uuid.id, { data: data2, name: name2, lastModified });
                    }
                  }
                  writeCustomIcons(parentNode, ctx) {
                    const node = XmlUtils.addChildNode(parentNode, XmlNames.Elem.CustomIcons);
                    for (const [uuid, { data: data2, name: name2, lastModified }] of this.customIcons) {
                      if (data2) {
                        const itemNode = XmlUtils.addChildNode(node, XmlNames.Elem.CustomIconItem);
                        XmlUtils.setUuid(XmlUtils.addChildNode(itemNode, XmlNames.Elem.CustomIconItemID), uuid);
                        XmlUtils.setBytes(XmlUtils.addChildNode(itemNode, XmlNames.Elem.CustomIconItemData), data2);
                        if (ctx.kdbx.versionIsAtLeast(4, 1)) {
                          if (name2) {
                            XmlUtils.setText(XmlUtils.addChildNode(itemNode, XmlNames.Elem.CustomIconItemName), name2);
                          }
                          if (lastModified) {
                            XmlUtils.setDate(XmlUtils.addChildNode(itemNode, XmlNames.Elem.LastModTime), lastModified);
                          }
                        }
                      }
                    }
                  }
                  readBinaries(node, ctx) {
                    for (let i = 0, cn = node.childNodes, len = cn.length; i < len; i++) {
                      const childNode = cn[i];
                      if (childNode.tagName === XmlNames.Elem.Binary) {
                        this.readBinary(childNode, ctx);
                      }
                    }
                  }
                  readBinary(node, ctx) {
                    const id = node.getAttribute(XmlNames.Attr.Id);
                    const binary = XmlUtils.getProtectedBinary(node);
                    if (id && binary) {
                      if (kdbx_binaries_1.KdbxBinaries.isKdbxBinaryRef(binary)) {
                        throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.FileCorrupt, "binary ref in meta");
                      }
                      ctx.kdbx.binaries.addWithId(id, binary);
                    }
                  }
                  writeBinaries(parentNode, ctx) {
                    const node = XmlUtils.addChildNode(parentNode, XmlNames.Elem.Binaries);
                    const binaries = ctx.kdbx.binaries.getAll();
                    for (const binary of binaries) {
                      const itemNode = XmlUtils.addChildNode(node, XmlNames.Elem.Binary);
                      itemNode.setAttribute(XmlNames.Attr.Id, binary.ref);
                      XmlUtils.setProtectedBinary(itemNode, binary.value);
                    }
                  }
                  readCustomData(node) {
                    this.customData = kdbx_custom_data_1.KdbxCustomData.read(node);
                  }
                  writeCustomData(parentNode, ctx) {
                    kdbx_custom_data_1.KdbxCustomData.write(parentNode, ctx, this.customData);
                  }
                  write(parentNode, ctx) {
                    this.generator = MetaConst.Generator;
                    const node = XmlUtils.addChildNode(parentNode, XmlNames.Elem.Meta);
                    XmlUtils.setText(XmlUtils.addChildNode(node, XmlNames.Elem.Generator), MetaConst.Generator);
                    if (ctx.kdbx.versionMajor < 4) {
                      XmlUtils.setBytes(XmlUtils.addChildNode(node, XmlNames.Elem.HeaderHash), this.headerHash);
                    } else if (this.settingsChanged) {
                      ctx.setXmlDate(XmlUtils.addChildNode(node, XmlNames.Elem.SettingsChanged), this.settingsChanged);
                    }
                    XmlUtils.setText(XmlUtils.addChildNode(node, XmlNames.Elem.DbName), this.name);
                    ctx.setXmlDate(XmlUtils.addChildNode(node, XmlNames.Elem.DbNameChanged), this.nameChanged);
                    XmlUtils.setText(XmlUtils.addChildNode(node, XmlNames.Elem.DbDesc), this.desc);
                    ctx.setXmlDate(XmlUtils.addChildNode(node, XmlNames.Elem.DbDescChanged), this.descChanged);
                    XmlUtils.setText(XmlUtils.addChildNode(node, XmlNames.Elem.DbDefaultUser), this.defaultUser);
                    ctx.setXmlDate(XmlUtils.addChildNode(node, XmlNames.Elem.DbDefaultUserChanged), this.defaultUserChanged);
                    XmlUtils.setNumber(XmlUtils.addChildNode(node, XmlNames.Elem.DbMntncHistoryDays), this.mntncHistoryDays);
                    XmlUtils.setText(XmlUtils.addChildNode(node, XmlNames.Elem.DbColor), this.color);
                    ctx.setXmlDate(XmlUtils.addChildNode(node, XmlNames.Elem.DbKeyChanged), this.keyChanged);
                    XmlUtils.setNumber(XmlUtils.addChildNode(node, XmlNames.Elem.DbKeyChangeRec), this.keyChangeRec);
                    XmlUtils.setNumber(XmlUtils.addChildNode(node, XmlNames.Elem.DbKeyChangeForce), this.keyChangeForce);
                    XmlUtils.setBoolean(XmlUtils.addChildNode(node, XmlNames.Elem.RecycleBinEnabled), this.recycleBinEnabled);
                    XmlUtils.setUuid(XmlUtils.addChildNode(node, XmlNames.Elem.RecycleBinUuid), this.recycleBinUuid);
                    ctx.setXmlDate(XmlUtils.addChildNode(node, XmlNames.Elem.RecycleBinChanged), this.recycleBinChanged);
                    XmlUtils.setUuid(XmlUtils.addChildNode(node, XmlNames.Elem.EntryTemplatesGroup), this.entryTemplatesGroup);
                    ctx.setXmlDate(XmlUtils.addChildNode(node, XmlNames.Elem.EntryTemplatesGroupChanged), this.entryTemplatesGroupChanged);
                    XmlUtils.setNumber(XmlUtils.addChildNode(node, XmlNames.Elem.HistoryMaxItems), this.historyMaxItems);
                    XmlUtils.setNumber(XmlUtils.addChildNode(node, XmlNames.Elem.HistoryMaxSize), this.historyMaxSize);
                    XmlUtils.setUuid(XmlUtils.addChildNode(node, XmlNames.Elem.LastSelectedGroup), this.lastSelectedGroup);
                    XmlUtils.setUuid(XmlUtils.addChildNode(node, XmlNames.Elem.LastTopVisibleGroup), this.lastTopVisibleGroup);
                    this.writeMemoryProtection(node);
                    this.writeCustomIcons(node, ctx);
                    if (ctx.exportXml || ctx.kdbx.versionMajor < 4) {
                      this.writeBinaries(node, ctx);
                    }
                    this.writeCustomData(node, ctx);
                  }
                  merge(remote, objectMap) {
                    var _a2, _b, _c, _d, _e, _f;
                    if (this.needUpdate(remote.nameChanged, this.nameChanged)) {
                      this._name = remote.name;
                      this.nameChanged = remote.nameChanged;
                    }
                    if (this.needUpdate(remote.descChanged, this.descChanged)) {
                      this._desc = remote.desc;
                      this.descChanged = remote.descChanged;
                    }
                    if (this.needUpdate(remote.defaultUserChanged, this.defaultUserChanged)) {
                      this._defaultUser = remote.defaultUser;
                      this.defaultUserChanged = remote.defaultUserChanged;
                    }
                    if (this.needUpdate(remote.keyChanged, this.keyChanged)) {
                      this.keyChanged = remote.keyChanged;
                    }
                    if (this.needUpdate(remote.settingsChanged, this.settingsChanged)) {
                      this.settingsChanged = remote.settingsChanged;
                    }
                    if (this.needUpdate(remote.recycleBinChanged, this.recycleBinChanged)) {
                      this._recycleBinEnabled = remote.recycleBinEnabled;
                      this._recycleBinUuid = remote.recycleBinUuid;
                      this.recycleBinChanged = remote.recycleBinChanged;
                    }
                    if (this.needUpdate(remote.entryTemplatesGroupChanged, this.entryTemplatesGroupChanged)) {
                      this._entryTemplatesGroup = remote.entryTemplatesGroup;
                      this.entryTemplatesGroupChanged = remote.entryTemplatesGroupChanged;
                    }
                    this.mergeMapWithDates(this.customData, remote.customData, objectMap);
                    this.mergeMapWithDates(this.customIcons, remote.customIcons, objectMap);
                    if (!((_a2 = this._editState) === null || _a2 === void 0 ? void 0 : _a2.historyMaxItemsChanged)) {
                      this.historyMaxItems = remote.historyMaxItems;
                    }
                    if (!((_b = this._editState) === null || _b === void 0 ? void 0 : _b.historyMaxSizeChanged)) {
                      this.historyMaxSize = remote.historyMaxSize;
                    }
                    if (!((_c = this._editState) === null || _c === void 0 ? void 0 : _c.keyChangeRecChanged)) {
                      this.keyChangeRec = remote.keyChangeRec;
                    }
                    if (!((_d = this._editState) === null || _d === void 0 ? void 0 : _d.keyChangeForceChanged)) {
                      this.keyChangeForce = remote.keyChangeForce;
                    }
                    if (!((_e = this._editState) === null || _e === void 0 ? void 0 : _e.mntncHistoryDaysChanged)) {
                      this.mntncHistoryDays = remote.mntncHistoryDays;
                    }
                    if (!((_f = this._editState) === null || _f === void 0 ? void 0 : _f.colorChanged)) {
                      this.color = remote.color;
                    }
                  }
                  mergeMapWithDates(local, remote, objectMap) {
                    for (const [key, remoteItem] of remote) {
                      const existingItem = local.get(key);
                      if (existingItem) {
                        if (existingItem.lastModified && remoteItem.lastModified && remoteItem.lastModified > existingItem.lastModified) {
                          local.set(key, remoteItem);
                        }
                      } else if (!objectMap.deleted.has(key)) {
                        local.set(key, remoteItem);
                      }
                    }
                  }
                  needUpdate(remoteDate, localDate) {
                    if (!remoteDate) {
                      return false;
                    }
                    if (!localDate) {
                      return true;
                    }
                    return remoteDate > localDate;
                  }
                  /**
                   * Creates new meta
                   * @returns {KdbxMeta}
                   */
                  static create() {
                    const now = /* @__PURE__ */ new Date();
                    const meta = new KdbxMeta();
                    meta.generator = MetaConst.Generator;
                    meta.settingsChanged = now;
                    meta.mntncHistoryDays = consts_1.Defaults.MntncHistoryDays;
                    meta.recycleBinEnabled = true;
                    meta.historyMaxItems = consts_1.Defaults.HistoryMaxItems;
                    meta.historyMaxSize = consts_1.Defaults.HistoryMaxSize;
                    meta.nameChanged = now;
                    meta.descChanged = now;
                    meta.defaultUserChanged = now;
                    meta.recycleBinChanged = now;
                    meta.keyChangeRec = -1;
                    meta.keyChangeForce = -1;
                    meta.entryTemplatesGroup = new kdbx_uuid_1.KdbxUuid();
                    meta.entryTemplatesGroupChanged = now;
                    meta.memoryProtection = {
                      title: false,
                      userName: false,
                      password: true,
                      url: false,
                      notes: false
                    };
                    return meta;
                  }
                  static read(xmlNode, ctx) {
                    const meta = new KdbxMeta();
                    for (let i = 0, cn = xmlNode.childNodes, len = cn.length; i < len; i++) {
                      const childNode = cn[i];
                      if (childNode.tagName) {
                        meta.readNode(childNode, ctx);
                      }
                    }
                    return meta;
                  }
                }
                exports2.KdbxMeta = KdbxMeta;
              })
            ),
            /***/
            "./format/kdbx-times.ts": (
              /*!******************************!*\
                !*** ./format/kdbx-times.ts ***!
                \******************************/
              /***/
              ((__unused_webpack_module, exports2, __webpack_require__2) => {
                Object.defineProperty(exports2, "__esModule", { value: true });
                exports2.KdbxTimes = void 0;
                const XmlNames = __webpack_require__2(
                  /*! ./../defs/xml-names */
                  "./defs/xml-names.ts"
                );
                const XmlUtils = __webpack_require__2(
                  /*! ./../utils/xml-utils */
                  "./utils/xml-utils.ts"
                );
                class KdbxTimes {
                  readNode(node) {
                    switch (node.tagName) {
                      case XmlNames.Elem.CreationTime:
                        this.creationTime = XmlUtils.getDate(node);
                        break;
                      case XmlNames.Elem.LastModTime:
                        this.lastModTime = XmlUtils.getDate(node);
                        break;
                      case XmlNames.Elem.LastAccessTime:
                        this.lastAccessTime = XmlUtils.getDate(node);
                        break;
                      case XmlNames.Elem.ExpiryTime:
                        this.expiryTime = XmlUtils.getDate(node);
                        break;
                      case XmlNames.Elem.Expires:
                        this.expires = XmlUtils.getBoolean(node);
                        break;
                      case XmlNames.Elem.UsageCount:
                        this.usageCount = XmlUtils.getNumber(node);
                        break;
                      case XmlNames.Elem.LocationChanged:
                        this.locationChanged = XmlUtils.getDate(node);
                        break;
                    }
                  }
                  clone() {
                    const clone = new KdbxTimes();
                    clone.creationTime = this.creationTime;
                    clone.lastModTime = this.lastModTime;
                    clone.lastAccessTime = this.lastAccessTime;
                    clone.expiryTime = this.expiryTime;
                    clone.expires = this.expires;
                    clone.usageCount = this.usageCount;
                    clone.locationChanged = this.locationChanged;
                    return clone;
                  }
                  update() {
                    const now = /* @__PURE__ */ new Date();
                    this.lastModTime = now;
                    this.lastAccessTime = now;
                  }
                  write(parentNode, ctx) {
                    const node = XmlUtils.addChildNode(parentNode, XmlNames.Elem.Times);
                    ctx.setXmlDate(XmlUtils.addChildNode(node, XmlNames.Elem.CreationTime), this.creationTime);
                    ctx.setXmlDate(XmlUtils.addChildNode(node, XmlNames.Elem.LastModTime), this.lastModTime);
                    ctx.setXmlDate(XmlUtils.addChildNode(node, XmlNames.Elem.LastAccessTime), this.lastAccessTime);
                    ctx.setXmlDate(XmlUtils.addChildNode(node, XmlNames.Elem.ExpiryTime), this.expiryTime);
                    XmlUtils.setBoolean(XmlUtils.addChildNode(node, XmlNames.Elem.Expires), this.expires);
                    XmlUtils.setNumber(XmlUtils.addChildNode(node, XmlNames.Elem.UsageCount), this.usageCount);
                    ctx.setXmlDate(XmlUtils.addChildNode(node, XmlNames.Elem.LocationChanged), this.locationChanged);
                  }
                  static create() {
                    const times = new KdbxTimes();
                    const now = /* @__PURE__ */ new Date();
                    times.creationTime = now;
                    times.lastModTime = now;
                    times.lastAccessTime = now;
                    times.expiryTime = now;
                    times.expires = false;
                    times.usageCount = 0;
                    times.locationChanged = now;
                    return times;
                  }
                  static read(xmlNode) {
                    const obj = new KdbxTimes();
                    for (let i = 0, cn = xmlNode.childNodes, len = cn.length; i < len; i++) {
                      const childNode = cn[i];
                      if (childNode.tagName) {
                        obj.readNode(childNode);
                      }
                    }
                    return obj;
                  }
                }
                exports2.KdbxTimes = KdbxTimes;
              })
            ),
            /***/
            "./format/kdbx-uuid.ts": (
              /*!*****************************!*\
                !*** ./format/kdbx-uuid.ts ***!
                \*****************************/
              /***/
              ((__unused_webpack_module, exports2, __webpack_require__2) => {
                Object.defineProperty(exports2, "__esModule", { value: true });
                exports2.KdbxUuid = void 0;
                const byte_utils_1 = __webpack_require__2(
                  /*! ../utils/byte-utils */
                  "./utils/byte-utils.ts"
                );
                const consts_1 = __webpack_require__2(
                  /*! ../defs/consts */
                  "./defs/consts.ts"
                );
                const kdbx_error_1 = __webpack_require__2(
                  /*! ../errors/kdbx-error */
                  "./errors/kdbx-error.ts"
                );
                const CryptoEngine2 = __webpack_require__2(
                  /*! ../crypto/crypto-engine */
                  "./crypto/crypto-engine.ts"
                );
                const UuidLength = 16;
                const EmptyUuidStr = "AAAAAAAAAAAAAAAAAAAAAA==";
                class KdbxUuid {
                  constructor(ab) {
                    if (ab === void 0) {
                      ab = new ArrayBuffer(UuidLength);
                    } else if (typeof ab === "string") {
                      ab = (0, byte_utils_1.base64ToBytes)(ab);
                    }
                    if (ab.byteLength !== UuidLength) {
                      throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.FileCorrupt, `bad UUID length: ${ab.byteLength}`);
                    }
                    this.id = (0, byte_utils_1.bytesToBase64)(ab);
                    this.empty = this.id === EmptyUuidStr;
                  }
                  equals(other) {
                    return other && other.toString() === this.toString() || false;
                  }
                  get bytes() {
                    return this.toBytes();
                  }
                  static random() {
                    return new KdbxUuid(CryptoEngine2.random(UuidLength));
                  }
                  toString() {
                    return this.id;
                  }
                  valueOf() {
                    return this.id;
                  }
                  toBytes() {
                    return (0, byte_utils_1.base64ToBytes)(this.id);
                  }
                }
                exports2.KdbxUuid = KdbxUuid;
              })
            ),
            /***/
            "./format/kdbx.ts": (
              /*!************************!*\
                !*** ./format/kdbx.ts ***!
                \************************/
              /***/
              ((__unused_webpack_module, exports2, __webpack_require__2) => {
                Object.defineProperty(exports2, "__esModule", { value: true });
                exports2.Kdbx = void 0;
                const XmlNames = __webpack_require__2(
                  /*! ../defs/xml-names */
                  "./defs/xml-names.ts"
                );
                const XmlUtils = __webpack_require__2(
                  /*! ./../utils/xml-utils */
                  "./utils/xml-utils.ts"
                );
                const kdbx_binaries_1 = __webpack_require__2(
                  /*! ./kdbx-binaries */
                  "./format/kdbx-binaries.ts"
                );
                const kdbx_deleted_object_1 = __webpack_require__2(
                  /*! ./kdbx-deleted-object */
                  "./format/kdbx-deleted-object.ts"
                );
                const kdbx_group_1 = __webpack_require__2(
                  /*! ./kdbx-group */
                  "./format/kdbx-group.ts"
                );
                const kdbx_meta_1 = __webpack_require__2(
                  /*! ./kdbx-meta */
                  "./format/kdbx-meta.ts"
                );
                const kdbx_credentials_1 = __webpack_require__2(
                  /*! ./kdbx-credentials */
                  "./format/kdbx-credentials.ts"
                );
                const kdbx_header_1 = __webpack_require__2(
                  /*! ./kdbx-header */
                  "./format/kdbx-header.ts"
                );
                const kdbx_error_1 = __webpack_require__2(
                  /*! ../errors/kdbx-error */
                  "./errors/kdbx-error.ts"
                );
                const consts_1 = __webpack_require__2(
                  /*! ../defs/consts */
                  "./defs/consts.ts"
                );
                const kdbx_format_1 = __webpack_require__2(
                  /*! ./kdbx-format */
                  "./format/kdbx-format.ts"
                );
                const kdbx_entry_1 = __webpack_require__2(
                  /*! ./kdbx-entry */
                  "./format/kdbx-entry.ts"
                );
                const kdbx_uuid_1 = __webpack_require__2(
                  /*! ./kdbx-uuid */
                  "./format/kdbx-uuid.ts"
                );
                class Kdbx2 {
                  constructor() {
                    this.header = new kdbx_header_1.KdbxHeader();
                    this.credentials = new kdbx_credentials_1.KdbxCredentials(null);
                    this.meta = new kdbx_meta_1.KdbxMeta();
                    this.binaries = new kdbx_binaries_1.KdbxBinaries();
                    this.groups = [];
                    this.deletedObjects = [];
                  }
                  get versionMajor() {
                    return this.header.versionMajor;
                  }
                  get versionMinor() {
                    return this.header.versionMinor;
                  }
                  /**
                   * Creates a new database
                   */
                  static create(credentials, name2) {
                    if (!(credentials instanceof kdbx_credentials_1.KdbxCredentials)) {
                      throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.InvalidArg, "credentials");
                    }
                    const kdbx = new Kdbx2();
                    kdbx.credentials = credentials;
                    kdbx.header = kdbx_header_1.KdbxHeader.create();
                    kdbx.meta = kdbx_meta_1.KdbxMeta.create();
                    kdbx.meta._name = name2;
                    kdbx.createDefaultGroup();
                    kdbx.createRecycleBin();
                    kdbx.meta._lastSelectedGroup = kdbx.getDefaultGroup().uuid;
                    kdbx.meta._lastTopVisibleGroup = kdbx.getDefaultGroup().uuid;
                    return kdbx;
                  }
                  /**
                   * Load a kdbx file
                   * If there was an error loading file, throws an exception
                   */
                  static load(data2, credentials, options) {
                    if (!(data2 instanceof ArrayBuffer)) {
                      return Promise.reject(new kdbx_error_1.KdbxError(consts_1.ErrorCodes.InvalidArg, "data"));
                    }
                    if (!(credentials instanceof kdbx_credentials_1.KdbxCredentials)) {
                      return Promise.reject(new kdbx_error_1.KdbxError(consts_1.ErrorCodes.InvalidArg, "credentials"));
                    }
                    const kdbx = new Kdbx2();
                    kdbx.credentials = credentials;
                    const format = new kdbx_format_1.KdbxFormat(kdbx);
                    format.preserveXml = (options === null || options === void 0 ? void 0 : options.preserveXml) || false;
                    return format.load(data2);
                  }
                  /**
                   * Import database from an xml file
                   * If there was an error loading file, throws an exception
                   */
                  static loadXml(data2, credentials) {
                    if (typeof data2 !== "string") {
                      return Promise.reject(new kdbx_error_1.KdbxError(consts_1.ErrorCodes.InvalidArg, "data"));
                    }
                    if (!(credentials instanceof kdbx_credentials_1.KdbxCredentials)) {
                      return Promise.reject(new kdbx_error_1.KdbxError(consts_1.ErrorCodes.InvalidArg, "credentials"));
                    }
                    const kdbx = new Kdbx2();
                    kdbx.credentials = credentials;
                    const format = new kdbx_format_1.KdbxFormat(kdbx);
                    return format.loadXml(data2);
                  }
                  /**
                   * Save the db to ArrayBuffer
                   */
                  save() {
                    const format = new kdbx_format_1.KdbxFormat(this);
                    return format.save();
                  }
                  /**
                   * Save the db as XML string
                   */
                  saveXml(prettyPrint = false) {
                    const format = new kdbx_format_1.KdbxFormat(this);
                    return format.saveXml(prettyPrint);
                  }
                  /**
                   * Creates a default group, if it's not yet created
                   */
                  createDefaultGroup() {
                    if (this.groups.length) {
                      return;
                    }
                    const defaultGroup = kdbx_group_1.KdbxGroup.create(this.meta.name || "");
                    defaultGroup.icon = consts_1.Icons.FolderOpen;
                    defaultGroup.expanded = true;
                    this.groups.push(defaultGroup);
                  }
                  /**
                   * Creates a recycle bin group, if it's not yet created
                   */
                  createRecycleBin() {
                    this.meta.recycleBinEnabled = true;
                    if (this.meta.recycleBinUuid && this.getGroup(this.meta.recycleBinUuid)) {
                      return;
                    }
                    const defGrp = this.getDefaultGroup();
                    const recycleBin = kdbx_group_1.KdbxGroup.create(consts_1.Defaults.RecycleBinName, defGrp);
                    recycleBin.icon = consts_1.Icons.TrashBin;
                    recycleBin.enableAutoType = false;
                    recycleBin.enableSearching = false;
                    this.meta.recycleBinUuid = recycleBin.uuid;
                    defGrp.groups.push(recycleBin);
                  }
                  /**
                   * Adds a new group to an existing group
                   */
                  createGroup(group, name2) {
                    const subGroup = kdbx_group_1.KdbxGroup.create(name2, group);
                    group.groups.push(subGroup);
                    return subGroup;
                  }
                  /**
                   * Adds a new entry to a group
                   */
                  createEntry(group) {
                    const entry = kdbx_entry_1.KdbxEntry.create(this.meta, group);
                    group.entries.push(entry);
                    return entry;
                  }
                  /**
                   * Gets the default group
                   */
                  getDefaultGroup() {
                    if (!this.groups[0]) {
                      throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.InvalidState, "empty default group");
                    }
                    return this.groups[0];
                  }
                  /**
                   * Get a group by uuid, returns undefined if it's not found
                   */
                  getGroup(uuid, parentGroup) {
                    const groups = parentGroup ? parentGroup.groups : this.groups;
                    for (const group of groups) {
                      if (group.uuid.equals(uuid)) {
                        return group;
                      }
                      const res = this.getGroup(uuid, group);
                      if (res) {
                        return res;
                      }
                    }
                  }
                  /**
                   * Move an object from one group to another
                   * @param object - object to be moved
                   * @param toGroup - target parent group
                   * @param atIndex - index in target group (by default, insert to the end of the group)
                   */
                  move(object, toGroup, atIndex) {
                    var _a2, _b;
                    const containerProp = object instanceof kdbx_group_1.KdbxGroup ? "groups" : "entries";
                    const fromContainer = (_a2 = object.parentGroup) === null || _a2 === void 0 ? void 0 : _a2[containerProp];
                    const ix = fromContainer === null || fromContainer === void 0 ? void 0 : fromContainer.indexOf(object);
                    if (typeof ix !== "number" || ix < 0) {
                      return;
                    }
                    fromContainer.splice(ix, 1);
                    if (toGroup) {
                      const toContainer = toGroup[containerProp];
                      if (typeof atIndex === "number" && atIndex >= 0) {
                        toContainer.splice(atIndex, 0, object);
                      } else {
                        toContainer.push(object);
                      }
                    } else {
                      const now = /* @__PURE__ */ new Date();
                      if (object instanceof kdbx_group_1.KdbxGroup) {
                        for (const item of object.allGroupsAndEntries()) {
                          const uuid = item.uuid;
                          this.addDeletedObject(uuid, now);
                        }
                      } else {
                        if (object.uuid) {
                          this.addDeletedObject(object.uuid, now);
                        }
                      }
                    }
                    object.previousParentGroup = (_b = object.parentGroup) === null || _b === void 0 ? void 0 : _b.uuid;
                    object.parentGroup = toGroup !== null && toGroup !== void 0 ? toGroup : void 0;
                    object.times.locationChanged = /* @__PURE__ */ new Date();
                  }
                  /**
                   * Adds a so-called deleted object, this is used to keep track of objects during merging
                   * @param uuid - object uuid
                   * @param dt - deletion date
                   */
                  addDeletedObject(uuid, dt) {
                    const deletedObject = new kdbx_deleted_object_1.KdbxDeletedObject();
                    deletedObject.uuid = uuid;
                    deletedObject.deletionTime = dt;
                    this.deletedObjects.push(deletedObject);
                  }
                  /**
                   * Delete an entry or a group
                   * Depending on settings, removes either to trash, or completely
                   */
                  remove(object) {
                    let toGroup = void 0;
                    if (this.meta.recycleBinEnabled && this.meta.recycleBinUuid) {
                      this.createRecycleBin();
                      toGroup = this.getGroup(this.meta.recycleBinUuid);
                    }
                    this.move(object, toGroup);
                  }
                  /**
                   * Creates a binary in the db and returns an object that can be put to entry.binaries
                   */
                  createBinary(value) {
                    return this.binaries.add(value);
                  }
                  /**
                   * Import an entry from another file
                   * It's up to caller to decide what should happen to the original entry in the source file
                   * Returns the new entry
                   * @param entry - entry to be imported
                   * @param group - target parent group
                   * @param file - the source file containing the group
                   */
                  importEntry(entry, group, file) {
                    const newEntry = new kdbx_entry_1.KdbxEntry();
                    const uuid = kdbx_uuid_1.KdbxUuid.random();
                    newEntry.copyFrom(entry);
                    newEntry.uuid = uuid;
                    for (const historyEntry of entry.history) {
                      const newHistoryEntry = new kdbx_entry_1.KdbxEntry();
                      newHistoryEntry.copyFrom(historyEntry);
                      newHistoryEntry.uuid = uuid;
                      newEntry.history.push(newHistoryEntry);
                    }
                    const binaries = /* @__PURE__ */ new Map();
                    const customIcons = /* @__PURE__ */ new Set();
                    for (const e of newEntry.history.concat(newEntry)) {
                      if (e.customIcon) {
                        customIcons.add(e.customIcon.id);
                      }
                      for (const binary of e.binaries.values()) {
                        if (kdbx_binaries_1.KdbxBinaries.isKdbxBinaryWithHash(binary)) {
                          binaries.set(binary.hash, binary);
                        }
                      }
                    }
                    for (const binary of binaries.values()) {
                      const fileBinary = file.binaries.getValueByHash(binary.hash);
                      if (fileBinary && !this.binaries.getValueByHash(binary.hash)) {
                        this.binaries.addWithHash(binary);
                      }
                    }
                    for (const customIconId of customIcons) {
                      const customIcon = file.meta.customIcons.get(customIconId);
                      if (customIcon) {
                        this.meta.customIcons.set(customIconId, customIcon);
                      }
                    }
                    group.entries.push(newEntry);
                    newEntry.parentGroup = group;
                    newEntry.times.update();
                    return newEntry;
                  }
                  /**
                   * Perform database cleanup
                   * @param settings.historyRules - remove extra history, it it doesn't match defined rules, e.g. records number
                   * @param settings.customIcons - remove unused custom icons
                   * @param settings.binaries - remove unused binaries
                   */
                  cleanup(settings) {
                    const now = /* @__PURE__ */ new Date();
                    const historyMaxItems = (settings === null || settings === void 0 ? void 0 : settings.historyRules) && typeof this.meta.historyMaxItems === "number" && this.meta.historyMaxItems >= 0 ? this.meta.historyMaxItems : Infinity;
                    const usedCustomIcons = /* @__PURE__ */ new Set();
                    const usedBinaries = /* @__PURE__ */ new Set();
                    const processEntry = (entry) => {
                      if (entry.customIcon) {
                        usedCustomIcons.add(entry.customIcon.id);
                      }
                      for (const binary of entry.binaries.values()) {
                        if (kdbx_binaries_1.KdbxBinaries.isKdbxBinaryWithHash(binary)) {
                          usedBinaries.add(binary.hash);
                        }
                      }
                    };
                    for (const item of this.getDefaultGroup().allGroupsAndEntries()) {
                      if (item instanceof kdbx_entry_1.KdbxEntry) {
                        if (item.history.length > historyMaxItems) {
                          item.removeHistory(0, item.history.length - historyMaxItems);
                        }
                        processEntry(item);
                        if (item.history) {
                          for (const historyEntry of item.history) {
                            processEntry(historyEntry);
                          }
                        }
                      } else {
                        if (item.customIcon) {
                          usedCustomIcons.add(item.customIcon.id);
                        }
                      }
                    }
                    if (settings === null || settings === void 0 ? void 0 : settings.customIcons) {
                      for (const customIcon of this.meta.customIcons.keys()) {
                        if (!usedCustomIcons.has(customIcon)) {
                          const uuid = new kdbx_uuid_1.KdbxUuid(customIcon);
                          this.addDeletedObject(uuid, now);
                          this.meta.customIcons.delete(customIcon);
                        }
                      }
                    }
                    if (settings === null || settings === void 0 ? void 0 : settings.binaries) {
                      for (const binary of this.binaries.getAllWithHashes()) {
                        if (!usedBinaries.has(binary.hash)) {
                          this.binaries.deleteWithHash(binary.hash);
                        }
                      }
                    }
                  }
                  /**
                   * Merge the db with another db
                   * Some parts of the remote DB are copied by reference, so it should NOT be modified after merge
                   * Suggested use case:
                   * - open the local db
                   * - get a remote db somehow and open in
                   * - merge the remote db into the local db: local.merge(remote)
                   * - close the remote db
                   * @param remote - database to merge in
                   */
                  merge(remote) {
                    const root = this.getDefaultGroup();
                    const remoteRoot = remote.getDefaultGroup();
                    if (!root || !remoteRoot) {
                      throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.MergeError, "no default group");
                    }
                    if (!root.uuid.equals(remoteRoot.uuid)) {
                      throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.MergeError, "default group is different");
                    }
                    const objectMap = this.getObjectMap();
                    for (const rem of remote.deletedObjects) {
                      if (rem.uuid && rem.deletionTime && !objectMap.deleted.has(rem.uuid.id)) {
                        this.deletedObjects.push(rem);
                        objectMap.deleted.set(rem.uuid.id, rem.deletionTime);
                      }
                    }
                    for (const remoteBinary of remote.binaries.getAllWithHashes()) {
                      if (!this.binaries.getValueByHash(remoteBinary.hash)) {
                        this.binaries.addWithHash(remoteBinary);
                      }
                    }
                    const remoteObjectMap = remote.getObjectMap();
                    objectMap.remoteEntries = remoteObjectMap.entries;
                    objectMap.remoteGroups = remoteObjectMap.groups;
                    this.meta.merge(remote.meta, objectMap);
                    root.merge(objectMap);
                    this.cleanup({ historyRules: true, customIcons: true, binaries: true });
                  }
                  /**
                   * Gets editing state tombstones (for successful merge)
                   * The replica must save this state with the db, assign in on opening the db,
                   * and call removeLocalEditState on successful upstream push.
                   * This state is JSON serializable.
                   */
                  getLocalEditState() {
                    const editingState = {
                      entries: {}
                    };
                    for (const entry of this.getDefaultGroup().allEntries()) {
                      if (entry._editState && entry.uuid && editingState.entries) {
                        editingState.entries[entry.uuid.id] = entry._editState;
                      }
                    }
                    if (this.meta._editState) {
                      editingState.meta = this.meta._editState;
                    }
                    return editingState;
                  }
                  /**
                   * Sets editing state tombstones returned previously by getLocalEditState
                   * The replica must call this method on opening the db to the state returned previously on getLocalEditState.
                   * @param editingState - result of getLocalEditState invoked before on saving the db
                   */
                  setLocalEditState(editingState) {
                    var _a2;
                    for (const entry of this.getDefaultGroup().allEntries()) {
                      if ((_a2 = editingState.entries) === null || _a2 === void 0 ? void 0 : _a2[entry.uuid.id]) {
                        entry._editState = editingState.entries[entry.uuid.id];
                      }
                    }
                    if (editingState.meta) {
                      this.meta._editState = editingState.meta;
                    }
                  }
                  /**
                   * Removes editing state tombstones
                   * Immediately after successful upstream push the replica must:
                   * - call this method
                   * - discard any previous state obtained by getLocalEditState call before
                   */
                  removeLocalEditState() {
                    for (const entry of this.getDefaultGroup().allEntries()) {
                      entry._editState = void 0;
                    }
                    this.meta._editState = void 0;
                  }
                  /**
                   * Upgrade the file to latest version
                   */
                  upgrade() {
                    this.setVersion(kdbx_header_1.KdbxHeader.MaxFileVersion);
                  }
                  /**
                   * Set the file version to a specified number
                   */
                  setVersion(version2) {
                    this.meta.headerHash = void 0;
                    this.meta.settingsChanged = /* @__PURE__ */ new Date();
                    this.header.setVersion(version2);
                  }
                  /**
                   * Set file key derivation function
                   * @param kdf - KDF id, from KdfId
                   */
                  setKdf(kdf) {
                    this.meta.headerHash = void 0;
                    this.meta.settingsChanged = /* @__PURE__ */ new Date();
                    this.header.setKdf(kdf);
                  }
                  getObjectMap() {
                    const objectMap = {
                      entries: /* @__PURE__ */ new Map(),
                      groups: /* @__PURE__ */ new Map(),
                      remoteEntries: /* @__PURE__ */ new Map(),
                      remoteGroups: /* @__PURE__ */ new Map(),
                      deleted: /* @__PURE__ */ new Map()
                    };
                    for (const item of this.getDefaultGroup().allGroupsAndEntries()) {
                      if (objectMap.entries.has(item.uuid.id)) {
                        throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.MergeError, `duplicate: ${item.uuid}`);
                      }
                      if (item instanceof kdbx_entry_1.KdbxEntry) {
                        objectMap.entries.set(item.uuid.id, item);
                      } else {
                        objectMap.groups.set(item.uuid.id, item);
                      }
                    }
                    for (const deletedObject of this.deletedObjects) {
                      if (deletedObject.uuid && deletedObject.deletionTime) {
                        objectMap.deleted.set(deletedObject.uuid.id, deletedObject.deletionTime);
                      }
                    }
                    return objectMap;
                  }
                  loadFromXml(ctx) {
                    if (!this.xml) {
                      throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.InvalidState, "xml is not set");
                    }
                    const doc = this.xml.documentElement;
                    if (doc.tagName !== XmlNames.Elem.DocNode) {
                      throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.FileCorrupt, "bad xml root");
                    }
                    this.parseMeta(ctx);
                    return this.binaries.computeHashes().then(() => {
                      this.parseRoot(ctx);
                      return this;
                    });
                  }
                  parseMeta(ctx) {
                    if (!this.xml) {
                      throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.InvalidState, "xml is not set");
                    }
                    const node = XmlUtils.getChildNode(this.xml.documentElement, XmlNames.Elem.Meta, "no meta node");
                    this.meta = kdbx_meta_1.KdbxMeta.read(node, ctx);
                  }
                  parseRoot(ctx) {
                    if (!this.xml) {
                      throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.InvalidState, "xml is not set");
                    }
                    this.groups = [];
                    this.deletedObjects = [];
                    const node = XmlUtils.getChildNode(this.xml.documentElement, XmlNames.Elem.Root, "no root node");
                    for (let i = 0, cn = node.childNodes, len = cn.length; i < len; i++) {
                      const childNode = cn[i];
                      switch (childNode.tagName) {
                        case XmlNames.Elem.Group:
                          this.readGroup(childNode, ctx);
                          break;
                        case XmlNames.Elem.DeletedObjects:
                          this.readDeletedObjects(childNode);
                          break;
                      }
                    }
                  }
                  readDeletedObjects(node) {
                    for (let i = 0, cn = node.childNodes, len = cn.length; i < len; i++) {
                      const childNode = cn[i];
                      switch (childNode.tagName) {
                        case XmlNames.Elem.DeletedObject:
                          this.deletedObjects.push(kdbx_deleted_object_1.KdbxDeletedObject.read(childNode));
                          break;
                      }
                    }
                  }
                  readGroup(node, ctx) {
                    this.groups.push(kdbx_group_1.KdbxGroup.read(node, ctx));
                  }
                  buildXml(ctx) {
                    const xml = XmlUtils.create(XmlNames.Elem.DocNode);
                    this.meta.write(xml.documentElement, ctx);
                    const rootNode = XmlUtils.addChildNode(xml.documentElement, XmlNames.Elem.Root);
                    for (const g of this.groups) {
                      g.write(rootNode, ctx);
                    }
                    const delObjNode = XmlUtils.addChildNode(rootNode, XmlNames.Elem.DeletedObjects);
                    for (const d of this.deletedObjects) {
                      d.write(delObjNode, ctx);
                    }
                    this.xml = xml;
                  }
                  versionIsAtLeast(major, minor) {
                    return this.versionMajor > major || this.versionMajor === major && this.versionMinor >= minor;
                  }
                }
                exports2.Kdbx = Kdbx2;
              })
            ),
            /***/
            "./utils/binary-stream.ts": (
              /*!********************************!*\
                !*** ./utils/binary-stream.ts ***!
                \********************************/
              /***/
              ((__unused_webpack_module, exports2) => {
                Object.defineProperty(exports2, "__esModule", { value: true });
                exports2.BinaryStream = void 0;
                class BinaryStream {
                  constructor(arrayBuffer) {
                    this._arrayBuffer = arrayBuffer || new ArrayBuffer(1024);
                    this._dataView = new DataView(this._arrayBuffer);
                    this._pos = 0;
                    this._canExpand = !arrayBuffer;
                  }
                  get pos() {
                    return this._pos;
                  }
                  get byteLength() {
                    return this._arrayBuffer.byteLength;
                  }
                  readBytes(size) {
                    const buffer = this._arrayBuffer.slice(this._pos, this._pos + size);
                    this._pos += size;
                    return buffer;
                  }
                  readBytesToEnd() {
                    const size = this._arrayBuffer.byteLength - this._pos;
                    return this.readBytes(size);
                  }
                  readBytesNoAdvance(startPos, endPos) {
                    return this._arrayBuffer.slice(startPos, endPos);
                  }
                  writeBytes(bytes) {
                    const arr = bytes instanceof ArrayBuffer ? new Uint8Array(bytes) : bytes;
                    this.checkCapacity(arr.length);
                    new Uint8Array(this._arrayBuffer).set(arr, this._pos);
                    this._pos += arr.length;
                  }
                  getWrittenBytes() {
                    return this._arrayBuffer.slice(0, this._pos);
                  }
                  checkCapacity(addBytes) {
                    const available = this._arrayBuffer.byteLength - this._pos;
                    if (this._canExpand && available < addBytes) {
                      let newLen = this._arrayBuffer.byteLength;
                      const requestedLen = this._pos + addBytes;
                      while (newLen < requestedLen) {
                        newLen *= 2;
                      }
                      const newData = new Uint8Array(newLen);
                      newData.set(new Uint8Array(this._arrayBuffer));
                      this._arrayBuffer = newData.buffer;
                      this._dataView = new DataView(this._arrayBuffer);
                    }
                  }
                  getInt8() {
                    const value = this._dataView.getInt8(this._pos);
                    this._pos += 1;
                    return value;
                  }
                  setInt8(value) {
                    this.checkCapacity(1);
                    this._dataView.setInt8(this._pos, value);
                    this._pos += 1;
                  }
                  getUint8() {
                    const value = this._dataView.getUint8(this._pos);
                    this._pos += 1;
                    return value;
                  }
                  setUint8(value) {
                    this.checkCapacity(1);
                    this._dataView.setUint8(this._pos, value);
                    this._pos += 1;
                  }
                  getInt16(littleEndian) {
                    const value = this._dataView.getInt16(this._pos, littleEndian);
                    this._pos += 2;
                    return value;
                  }
                  setInt16(value, littleEndian) {
                    this.checkCapacity(2);
                    this._dataView.setInt16(this._pos, value, littleEndian);
                    this._pos += 2;
                  }
                  getUint16(littleEndian) {
                    const value = this._dataView.getUint16(this._pos, littleEndian);
                    this._pos += 2;
                    return value;
                  }
                  setUint16(value, littleEndian) {
                    this.checkCapacity(2);
                    this._dataView.setUint16(this._pos, value, littleEndian);
                    this._pos += 2;
                  }
                  getInt32(littleEndian) {
                    const value = this._dataView.getInt32(this._pos, littleEndian);
                    this._pos += 4;
                    return value;
                  }
                  setInt32(value, littleEndian) {
                    this.checkCapacity(4);
                    this._dataView.setInt32(this._pos, value, littleEndian);
                    this._pos += 4;
                  }
                  getUint32(littleEndian) {
                    const value = this._dataView.getUint32(this._pos, littleEndian);
                    this._pos += 4;
                    return value;
                  }
                  setUint32(value, littleEndian) {
                    this.checkCapacity(4);
                    this._dataView.setUint32(this._pos, value, littleEndian);
                    this._pos += 4;
                  }
                  getFloat32(littleEndian) {
                    const value = this._dataView.getFloat32(this._pos, littleEndian);
                    this._pos += 4;
                    return value;
                  }
                  setFloat32(value, littleEndian) {
                    this.checkCapacity(4);
                    this._dataView.setFloat32(this._pos, value, littleEndian);
                    this._pos += 4;
                  }
                  getFloat64(littleEndian) {
                    const value = this._dataView.getFloat64(this._pos, littleEndian);
                    this._pos += 8;
                    return value;
                  }
                  setFloat64(value, littleEndian) {
                    this.checkCapacity(8);
                    this._dataView.setFloat64(this._pos, value, littleEndian);
                    this._pos += 8;
                  }
                  getUint64(littleEndian) {
                    let part1 = this.getUint32(littleEndian), part2 = this.getUint32(littleEndian);
                    if (littleEndian) {
                      part2 *= 4294967296;
                    } else {
                      part1 *= 4294967296;
                    }
                    return part1 + part2;
                  }
                  setUint64(value, littleEndian) {
                    if (littleEndian) {
                      this.setUint32(value & 4294967295, true);
                      this.setUint32(Math.floor(value / 4294967296), true);
                    } else {
                      this.checkCapacity(8);
                      this.setUint32(Math.floor(value / 4294967296), false);
                      this.setUint32(value & 4294967295, false);
                    }
                  }
                }
                exports2.BinaryStream = BinaryStream;
              })
            ),
            /***/
            "./utils/byte-utils.ts": (
              /*!*****************************!*\
                !*** ./utils/byte-utils.ts ***!
                \*****************************/
              /***/
              ((__unused_webpack_module, exports2) => {
                Object.defineProperty(exports2, "__esModule", { value: true });
                exports2.zeroBuffer = exports2.arrayToBuffer = exports2.bytesToHex = exports2.hexToBytes = exports2.bytesToBase64 = exports2.base64ToBytes = exports2.stringToBytes = exports2.bytesToString = exports2.arrayBufferEquals = void 0;
                const textEncoder2 = new TextEncoder();
                const textDecoder = new TextDecoder();
                function arrayBufferEquals(ab1, ab2) {
                  if (ab1.byteLength !== ab2.byteLength) {
                    return false;
                  }
                  const arr1 = new Uint8Array(ab1);
                  const arr2 = new Uint8Array(ab2);
                  for (let i = 0, len = arr1.length; i < len; i++) {
                    if (arr1[i] !== arr2[i]) {
                      return false;
                    }
                  }
                  return true;
                }
                exports2.arrayBufferEquals = arrayBufferEquals;
                function bytesToString(arr) {
                  if (arr instanceof ArrayBuffer) {
                    arr = new Uint8Array(arr);
                  }
                  return textDecoder.decode(arr);
                }
                exports2.bytesToString = bytesToString;
                function stringToBytes(str) {
                  return textEncoder2.encode(str);
                }
                exports2.stringToBytes = stringToBytes;
                function base64ToBytes(str) {
                  if (typeof atob === "function") {
                    const byteStr = atob(str);
                    const arr = new Uint8Array(byteStr.length);
                    for (let i = 0; i < byteStr.length; i++) {
                      arr[i] = byteStr.charCodeAt(i);
                    }
                    return arr;
                  } else {
                    const buffer = Buffer.from(str, "base64");
                    return new Uint8Array(buffer);
                  }
                }
                exports2.base64ToBytes = base64ToBytes;
                function bytesToBase64(arr) {
                  const intArr = arr instanceof ArrayBuffer ? new Uint8Array(arr) : arr;
                  if (typeof btoa === "function") {
                    let str = "";
                    for (let i = 0; i < intArr.length; i++) {
                      str += String.fromCharCode(intArr[i]);
                    }
                    return btoa(str);
                  } else {
                    const buffer = Buffer.from(arr);
                    return buffer.toString("base64");
                  }
                }
                exports2.bytesToBase64 = bytesToBase64;
                function hexToBytes3(hex) {
                  const arr = new Uint8Array(Math.ceil(hex.length / 2));
                  for (let i = 0; i < arr.length; i++) {
                    arr[i] = parseInt(hex.substr(i * 2, 2), 16);
                  }
                  return arr;
                }
                exports2.hexToBytes = hexToBytes3;
                function bytesToHex3(arr) {
                  const intArr = arr instanceof ArrayBuffer ? new Uint8Array(arr) : arr;
                  let str = "";
                  for (let i = 0; i < intArr.length; i++) {
                    const byte = intArr[i].toString(16);
                    if (byte.length === 1) {
                      str += "0";
                    }
                    str += byte;
                  }
                  return str;
                }
                exports2.bytesToHex = bytesToHex3;
                function arrayToBuffer(arr) {
                  if (arr instanceof ArrayBuffer) {
                    return arr;
                  }
                  const ab = arr.buffer;
                  if (arr.byteOffset === 0 && arr.byteLength === ab.byteLength) {
                    return ab;
                  }
                  return arr.buffer.slice(arr.byteOffset, arr.byteOffset + arr.byteLength);
                }
                exports2.arrayToBuffer = arrayToBuffer;
                function zeroBuffer(arr) {
                  const intArr = arr instanceof ArrayBuffer ? new Uint8Array(arr) : arr;
                  intArr.fill(0);
                }
                exports2.zeroBuffer = zeroBuffer;
              })
            ),
            /***/
            "./utils/int64.ts": (
              /*!************************!*\
                !*** ./utils/int64.ts ***!
                \************************/
              /***/
              ((__unused_webpack_module, exports2) => {
                Object.defineProperty(exports2, "__esModule", { value: true });
                exports2.Int64 = void 0;
                class Int642 {
                  constructor(lo = 0, hi = 0) {
                    this.lo = lo;
                    this.hi = hi;
                  }
                  get value() {
                    if (this.hi) {
                      if (this.hi >= 2097152) {
                        throw new Error("too large number");
                      }
                      return this.hi * 4294967296 + this.lo;
                    }
                    return this.lo;
                  }
                  valueOf() {
                    return this.value;
                  }
                  static from(value) {
                    if (value > 9007199254740991) {
                      throw new Error("too large number");
                    }
                    const lo = value >>> 0;
                    const hi = (value - lo) / 4294967296 >>> 0;
                    return new Int642(lo, hi);
                  }
                }
                exports2.Int64 = Int642;
              })
            ),
            /***/
            "./utils/var-dictionary.ts": (
              /*!*********************************!*\
                !*** ./utils/var-dictionary.ts ***!
                \*********************************/
              /***/
              ((__unused_webpack_module, exports2, __webpack_require__2) => {
                Object.defineProperty(exports2, "__esModule", { value: true });
                exports2.VarDictionary = exports2.ValueType = void 0;
                const kdbx_error_1 = __webpack_require__2(
                  /*! ../errors/kdbx-error */
                  "./errors/kdbx-error.ts"
                );
                const consts_1 = __webpack_require__2(
                  /*! ../defs/consts */
                  "./defs/consts.ts"
                );
                const byte_utils_1 = __webpack_require__2(
                  /*! ./byte-utils */
                  "./utils/byte-utils.ts"
                );
                const int64_1 = __webpack_require__2(
                  /*! ./int64 */
                  "./utils/int64.ts"
                );
                const MaxSupportedVersion = 1;
                const DefaultVersion = 256;
                var ValueType;
                (function(ValueType2) {
                  ValueType2[ValueType2["UInt32"] = 4] = "UInt32";
                  ValueType2[ValueType2["UInt64"] = 5] = "UInt64";
                  ValueType2[ValueType2["Bool"] = 8] = "Bool";
                  ValueType2[ValueType2["Int32"] = 12] = "Int32";
                  ValueType2[ValueType2["Int64"] = 13] = "Int64";
                  ValueType2[ValueType2["String"] = 24] = "String";
                  ValueType2[ValueType2["Bytes"] = 66] = "Bytes";
                })(ValueType = exports2.ValueType || (exports2.ValueType = {}));
                class VarDictionary2 {
                  constructor() {
                    this._items = [];
                    this._map = /* @__PURE__ */ new Map();
                  }
                  keys() {
                    return this._items.map((item) => item.key);
                  }
                  get length() {
                    return this._items.length;
                  }
                  get(key) {
                    const item = this._map.get(key);
                    return item ? item.value : void 0;
                  }
                  set(key, type, value) {
                    let item;
                    switch (type) {
                      case ValueType.UInt32:
                        if (typeof value !== "number" || value < 0) {
                          throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.InvalidArg);
                        }
                        item = { key, type, value };
                        break;
                      case ValueType.UInt64:
                        if (!(value instanceof int64_1.Int64)) {
                          throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.InvalidArg);
                        }
                        item = { key, type, value };
                        break;
                      case ValueType.Bool:
                        if (typeof value !== "boolean") {
                          throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.InvalidArg);
                        }
                        item = { key, type, value };
                        break;
                      case ValueType.Int32:
                        if (typeof value !== "number") {
                          throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.InvalidArg);
                        }
                        item = { key, type, value };
                        break;
                      case ValueType.Int64:
                        if (!(value instanceof int64_1.Int64)) {
                          throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.InvalidArg);
                        }
                        item = { key, type, value };
                        break;
                      case ValueType.String:
                        if (typeof value !== "string") {
                          throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.InvalidArg);
                        }
                        item = { key, type, value };
                        break;
                      case ValueType.Bytes:
                        if (value instanceof Uint8Array) {
                          value = (0, byte_utils_1.arrayToBuffer)(value);
                        }
                        if (!(value instanceof ArrayBuffer)) {
                          throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.InvalidArg);
                        }
                        item = { key, type, value };
                        break;
                      default:
                        throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.InvalidArg);
                    }
                    const existing = this._map.get(key);
                    if (existing) {
                      const ix = this._items.indexOf(existing);
                      this._items.splice(ix, 1, item);
                    } else {
                      this._items.push(item);
                    }
                    this._map.set(key, item);
                  }
                  remove(key) {
                    this._items = this._items.filter((item) => {
                      return item.key !== key;
                    });
                    this._map.delete(key);
                  }
                  static read(stm) {
                    const dict = new VarDictionary2();
                    dict.readVersion(stm);
                    for (let item; item = dict.readItem(stm); ) {
                      dict._items.push(item);
                      dict._map.set(item.key, item);
                    }
                    return dict;
                  }
                  readVersion(stm) {
                    stm.getUint8();
                    const versionMajor = stm.getUint8();
                    if (versionMajor === 0 || versionMajor > MaxSupportedVersion) {
                      throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.InvalidVersion);
                    }
                  }
                  readItem(stm) {
                    const type = stm.getUint8();
                    if (!type) {
                      return void 0;
                    }
                    const keyLength = stm.getInt32(true);
                    if (keyLength <= 0) {
                      throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.FileCorrupt, "bad key length");
                    }
                    const key = (0, byte_utils_1.bytesToString)(stm.readBytes(keyLength));
                    const valueLength = stm.getInt32(true);
                    if (valueLength < 0) {
                      throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.FileCorrupt, "bad value length");
                    }
                    switch (type) {
                      case ValueType.UInt32: {
                        if (valueLength !== 4) {
                          throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.FileCorrupt, "bad uint32");
                        }
                        const value = stm.getUint32(true);
                        return { key, type, value };
                      }
                      case ValueType.UInt64: {
                        if (valueLength !== 8) {
                          throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.FileCorrupt, "bad uint64");
                        }
                        const loInt = stm.getUint32(true);
                        const hiInt = stm.getUint32(true);
                        const value = new int64_1.Int64(loInt, hiInt);
                        return { key, type, value };
                      }
                      case ValueType.Bool: {
                        if (valueLength !== 1) {
                          throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.FileCorrupt, "bad bool");
                        }
                        const value = stm.getUint8() !== 0;
                        return { key, type, value };
                      }
                      case ValueType.Int32: {
                        if (valueLength !== 4) {
                          throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.FileCorrupt, "bad int32");
                        }
                        const value = stm.getInt32(true);
                        return { key, type, value };
                      }
                      case ValueType.Int64: {
                        if (valueLength !== 8) {
                          throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.FileCorrupt, "bad int64");
                        }
                        const loUint = stm.getUint32(true);
                        const hiUint = stm.getUint32(true);
                        const value = new int64_1.Int64(loUint, hiUint);
                        return { key, type, value };
                      }
                      case ValueType.String: {
                        const value = (0, byte_utils_1.bytesToString)(stm.readBytes(valueLength));
                        return { key, type, value };
                      }
                      case ValueType.Bytes: {
                        const value = stm.readBytes(valueLength);
                        return { key, type, value };
                      }
                      default:
                        throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.FileCorrupt, `bad value type: ${type}`);
                    }
                  }
                  write(stm) {
                    this.writeVersion(stm);
                    for (const item of this._items) {
                      this.writeItem(stm, item);
                    }
                    stm.setUint8(0);
                  }
                  writeVersion(stm) {
                    stm.setUint16(DefaultVersion, true);
                  }
                  writeItem(stm, item) {
                    stm.setUint8(item.type);
                    const keyBytes = (0, byte_utils_1.stringToBytes)(item.key);
                    stm.setInt32(keyBytes.length, true);
                    stm.writeBytes(keyBytes);
                    switch (item.type) {
                      case ValueType.UInt32:
                        stm.setInt32(4, true);
                        stm.setUint32(item.value, true);
                        break;
                      case ValueType.UInt64:
                        stm.setInt32(8, true);
                        stm.setUint32(item.value.lo, true);
                        stm.setUint32(item.value.hi, true);
                        break;
                      case ValueType.Bool:
                        stm.setInt32(1, true);
                        stm.setUint8(item.value ? 1 : 0);
                        break;
                      case ValueType.Int32:
                        stm.setInt32(4, true);
                        stm.setInt32(item.value, true);
                        break;
                      case ValueType.Int64:
                        stm.setInt32(8, true);
                        stm.setUint32(item.value.lo, true);
                        stm.setUint32(item.value.hi, true);
                        break;
                      case ValueType.String: {
                        const strBytes = (0, byte_utils_1.stringToBytes)(item.value);
                        stm.setInt32(strBytes.length, true);
                        stm.writeBytes(strBytes);
                        break;
                      }
                      case ValueType.Bytes: {
                        const bytesBuffer = (0, byte_utils_1.arrayToBuffer)(item.value);
                        stm.setInt32(bytesBuffer.byteLength, true);
                        stm.writeBytes(bytesBuffer);
                        break;
                      }
                      default:
                        throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.Unsupported);
                    }
                  }
                }
                exports2.VarDictionary = VarDictionary2;
                VarDictionary2.ValueType = ValueType;
              })
            ),
            /***/
            "./utils/xml-utils.ts": (
              /*!****************************!*\
                !*** ./utils/xml-utils.ts ***!
                \****************************/
              /***/
              ((__unused_webpack_module, exports2, __webpack_require__2) => {
                Object.defineProperty(exports2, "__esModule", { value: true });
                exports2.protectPlainValues = exports2.protectUnprotectedValues = exports2.unprotectValues = exports2.updateProtectedValuesSalt = exports2.setProtectedValues = exports2.traverse = exports2.setProtectedBinary = exports2.getProtectedBinary = exports2.setProtectedText = exports2.getProtectedText = exports2.setUuid = exports2.getUuid = exports2.strToBoolean = exports2.setBoolean = exports2.getBoolean = exports2.setNumber = exports2.getNumber = exports2.setDate = exports2.getDate = exports2.setBytes = exports2.getBytes = exports2.setTags = exports2.getTags = exports2.setText = exports2.getText = exports2.addChildNode = exports2.getChildNode = exports2.create = exports2.serialize = exports2.parse = void 0;
                const fflate_1 = __webpack_require__2(
                  /*! fflate */
                  "../node_modules/fflate/lib/index.cjs"
                );
                const kdbx_error_1 = __webpack_require__2(
                  /*! ../errors/kdbx-error */
                  "./errors/kdbx-error.ts"
                );
                const consts_1 = __webpack_require__2(
                  /*! ../defs/consts */
                  "./defs/consts.ts"
                );
                const XmlNames = __webpack_require__2(
                  /*! ../defs/xml-names */
                  "./defs/xml-names.ts"
                );
                const byte_utils_1 = __webpack_require__2(
                  /*! ./byte-utils */
                  "./utils/byte-utils.ts"
                );
                const int64_1 = __webpack_require__2(
                  /*! ./int64 */
                  "./utils/int64.ts"
                );
                const kdbx_uuid_1 = __webpack_require__2(
                  /*! ../format/kdbx-uuid */
                  "./format/kdbx-uuid.ts"
                );
                const protected_value_1 = __webpack_require__2(
                  /*! ../crypto/protected-value */
                  "./crypto/protected-value.ts"
                );
                const kdbx_binaries_1 = __webpack_require__2(
                  /*! ../format/kdbx-binaries */
                  "./format/kdbx-binaries.ts"
                );
                const DateRegex = /\.\d\d\d/;
                const EpochSeconds = 62135596800;
                const TagsSplitRegex = /\s*[;,:]\s*/;
                function createDOMParser() {
                  if (__webpack_require__2.g.DOMParser) {
                    return new __webpack_require__2.g.DOMParser();
                  }
                  const parserArg = {
                    errorHandler: {
                      warning: (e) => {
                        throw e;
                      },
                      error: (e) => {
                        throw e;
                      },
                      fatalError: (e) => {
                        throw e;
                      }
                    }
                  };
                  const { DOMParser } = __webpack_require__2(
                    /*! @xmldom/xmldom */
                    "@xmldom/xmldom"
                  );
                  return new DOMParser(parserArg);
                }
                function createXMLSerializer() {
                  if (__webpack_require__2.g.XMLSerializer) {
                    return new __webpack_require__2.g.XMLSerializer();
                  }
                  const { XMLSerializer } = __webpack_require__2(
                    /*! @xmldom/xmldom */
                    "@xmldom/xmldom"
                  );
                  return new XMLSerializer();
                }
                function parse(xml) {
                  const parser = createDOMParser();
                  let doc;
                  xml = xml.replace(/[\x00-\x09\x0B-\x0C\x0E-\x1F]/g, "");
                  try {
                    doc = parser.parseFromString(xml, "application/xml");
                  } catch (e) {
                    const errMsg = e instanceof Error ? e.message : String(e);
                    throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.FileCorrupt, `bad xml: ${errMsg}`);
                  }
                  if (!doc.documentElement) {
                    throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.FileCorrupt, "bad xml");
                  }
                  const parserError = doc.getElementsByTagName("parsererror")[0];
                  if (parserError) {
                    throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.FileCorrupt, `bad xml: ${parserError.textContent}`);
                  }
                  return doc;
                }
                exports2.parse = parse;
                function serialize(doc, prettyPrint = false) {
                  if (prettyPrint) {
                    prettyPrintXmlNode(doc, 0);
                  }
                  let xml = createXMLSerializer().serializeToString(doc);
                  if (prettyPrint && xml.startsWith("<?")) {
                    xml = xml.replace(/^(<\?.*?\?>)</, "$1\n<");
                  }
                  return xml;
                }
                exports2.serialize = serialize;
                function prettyPrintXmlNode(node, indentationLevel) {
                  const numChildNodes = node.childNodes.length;
                  if (numChildNodes === 0) {
                    return;
                  }
                  const formatStr = "\n" + "    ".repeat(indentationLevel);
                  const prevFormatStr = indentationLevel > 0 ? "\n" + "    ".repeat(indentationLevel - 1) : "";
                  const doc = node.ownerDocument || node;
                  const childNodes = [];
                  let childNode;
                  for (let i = 0; i < numChildNodes; i++) {
                    childNode = node.childNodes[i];
                    if (childNode.nodeType !== doc.TEXT_NODE && childNode.nodeType !== doc.PROCESSING_INSTRUCTION_NODE) {
                      childNodes.push(childNode);
                    }
                  }
                  for (let j = 0; j < childNodes.length; j++) {
                    childNode = childNodes[j];
                    const isFirstDocumentNode = indentationLevel === 0 && j === 0;
                    if (!isFirstDocumentNode) {
                      const textNodeBefore = doc.createTextNode(formatStr);
                      node.insertBefore(textNodeBefore, childNode);
                    }
                    if (!childNode.nextSibling && indentationLevel > 0) {
                      const textNodeAfter = doc.createTextNode(prevFormatStr);
                      node.appendChild(textNodeAfter);
                    }
                    prettyPrintXmlNode(childNode, indentationLevel + 1);
                  }
                }
                function create(rootNode) {
                  return parse('<?xml version="1.0" encoding="utf-8" standalone="yes"?><' + rootNode + "/>");
                }
                exports2.create = create;
                function getChildNode(node, tagName, errorMsgIfAbsent) {
                  if (node && node.childNodes) {
                    for (let i = 0, cn = node.childNodes, len = cn.length; i < len; i++) {
                      if (cn[i].tagName === tagName) {
                        return cn[i];
                      }
                    }
                  }
                  if (errorMsgIfAbsent) {
                    throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.FileCorrupt, errorMsgIfAbsent);
                  } else {
                    return null;
                  }
                }
                exports2.getChildNode = getChildNode;
                function addChildNode(node, tagName) {
                  return node.appendChild((node.ownerDocument || node).createElement(tagName));
                }
                exports2.addChildNode = addChildNode;
                function getText(node) {
                  var _a2;
                  if (!(node === null || node === void 0 ? void 0 : node.childNodes)) {
                    return void 0;
                  }
                  return node.protectedValue ? node.protectedValue.getText() : (_a2 = node.textContent) !== null && _a2 !== void 0 ? _a2 : void 0;
                }
                exports2.getText = getText;
                function setText(node, text) {
                  node.textContent = text || "";
                }
                exports2.setText = setText;
                function getTags(node) {
                  const text = getText(node);
                  if (!text) {
                    return [];
                  }
                  return text.split(TagsSplitRegex).map((t) => t.trim()).filter((s) => s);
                }
                exports2.getTags = getTags;
                function setTags(node, tags) {
                  setText(node, tags.join(", "));
                }
                exports2.setTags = setTags;
                function getBytes(node) {
                  const text = getText(node);
                  return text ? (0, byte_utils_1.arrayToBuffer)((0, byte_utils_1.base64ToBytes)(text)) : void 0;
                }
                exports2.getBytes = getBytes;
                function setBytes(node, bytes) {
                  if (typeof bytes === "string") {
                    bytes = (0, byte_utils_1.base64ToBytes)(bytes);
                  }
                  setText(node, bytes ? (0, byte_utils_1.bytesToBase64)((0, byte_utils_1.arrayToBuffer)(bytes)) : void 0);
                }
                exports2.setBytes = setBytes;
                function getDate(node) {
                  const text = getText(node);
                  if (!text) {
                    return void 0;
                  }
                  if (text.indexOf(":") > 0) {
                    return new Date(text);
                  }
                  const bytes = new DataView((0, byte_utils_1.arrayToBuffer)((0, byte_utils_1.base64ToBytes)(text)));
                  const secondsFrom00 = new int64_1.Int64(bytes.getUint32(0, true), bytes.getUint32(4, true)).value;
                  const diff = (secondsFrom00 - EpochSeconds) * 1e3;
                  return new Date(diff);
                }
                exports2.getDate = getDate;
                function setDate(node, date, binary = false) {
                  if (date) {
                    if (binary) {
                      const secondsFrom00 = Math.floor(date.getTime() / 1e3) + EpochSeconds;
                      const bytes = new DataView(new ArrayBuffer(8));
                      const val64 = int64_1.Int64.from(secondsFrom00);
                      bytes.setUint32(0, val64.lo, true);
                      bytes.setUint32(4, val64.hi, true);
                      setText(node, (0, byte_utils_1.bytesToBase64)(bytes.buffer));
                    } else {
                      setText(node, date.toISOString().replace(DateRegex, ""));
                    }
                  } else {
                    setText(node, "");
                  }
                }
                exports2.setDate = setDate;
                function getNumber(node) {
                  const text = getText(node);
                  return text ? +text : void 0;
                }
                exports2.getNumber = getNumber;
                function setNumber(node, number) {
                  setText(node, typeof number === "number" && !isNaN(number) ? number.toString() : void 0);
                }
                exports2.setNumber = setNumber;
                function getBoolean(node) {
                  const text = getText(node);
                  return text ? strToBoolean(text) : void 0;
                }
                exports2.getBoolean = getBoolean;
                function setBoolean(node, boolean) {
                  setText(node, boolean === void 0 ? "" : boolean === null ? "null" : boolean ? "True" : "False");
                }
                exports2.setBoolean = setBoolean;
                function strToBoolean(str) {
                  switch (str === null || str === void 0 ? void 0 : str.toLowerCase()) {
                    case "true":
                      return true;
                    case "false":
                      return false;
                    case "null":
                      return null;
                  }
                  return void 0;
                }
                exports2.strToBoolean = strToBoolean;
                function getUuid(node) {
                  const bytes = getBytes(node);
                  return bytes ? new kdbx_uuid_1.KdbxUuid(bytes) : void 0;
                }
                exports2.getUuid = getUuid;
                function setUuid(node, uuid) {
                  const uuidBytes = uuid instanceof kdbx_uuid_1.KdbxUuid ? uuid.toBytes() : uuid;
                  setBytes(node, uuidBytes);
                }
                exports2.setUuid = setUuid;
                function getProtectedText(node) {
                  var _a2;
                  return (_a2 = node.protectedValue || node.textContent) !== null && _a2 !== void 0 ? _a2 : void 0;
                }
                exports2.getProtectedText = getProtectedText;
                function setProtectedText(node, text) {
                  if (text instanceof protected_value_1.ProtectedValue) {
                    node.protectedValue = text;
                    node.setAttribute(XmlNames.Attr.Protected, "True");
                  } else {
                    setText(node, text);
                  }
                }
                exports2.setProtectedText = setProtectedText;
                function getProtectedBinary(node) {
                  if (node.protectedValue) {
                    return node.protectedValue;
                  }
                  const text = node.textContent;
                  const ref = node.getAttribute(XmlNames.Attr.Ref);
                  if (ref) {
                    return { ref };
                  }
                  if (!text) {
                    return void 0;
                  }
                  const compressed = strToBoolean(node.getAttribute(XmlNames.Attr.Compressed));
                  let bytes = (0, byte_utils_1.base64ToBytes)(text);
                  if (compressed) {
                    bytes = (0, fflate_1.gunzipSync)(bytes);
                  }
                  return (0, byte_utils_1.arrayToBuffer)(bytes);
                }
                exports2.getProtectedBinary = getProtectedBinary;
                function setProtectedBinary(node, binary) {
                  if (binary instanceof protected_value_1.ProtectedValue) {
                    node.protectedValue = binary;
                    node.setAttribute(XmlNames.Attr.Protected, "True");
                  } else if (kdbx_binaries_1.KdbxBinaries.isKdbxBinaryRef(binary)) {
                    node.setAttribute(XmlNames.Attr.Ref, binary.ref);
                  } else {
                    setBytes(node, binary);
                  }
                }
                exports2.setProtectedBinary = setProtectedBinary;
                function traverse(node, callback) {
                  callback(node);
                  for (let i = 0, cn = node.childNodes, len = cn.length; i < len; i++) {
                    const childNode = cn[i];
                    if (childNode.tagName) {
                      traverse(childNode, callback);
                    }
                  }
                }
                exports2.traverse = traverse;
                function setProtectedValues(node, protectSaltGenerator) {
                  traverse(node, (node2) => {
                    if (strToBoolean(node2.getAttribute(XmlNames.Attr.Protected))) {
                      try {
                        const value = (0, byte_utils_1.arrayToBuffer)((0, byte_utils_1.base64ToBytes)(node2.textContent || ""));
                        if (value.byteLength) {
                          const salt = protectSaltGenerator.getSalt(value.byteLength);
                          node2.protectedValue = new protected_value_1.ProtectedValue(value, salt);
                        }
                      } catch (e) {
                        throw new kdbx_error_1.KdbxError(consts_1.ErrorCodes.FileCorrupt, `bad protected value at line ${node2.lineNumber}: ${e}`);
                      }
                    }
                  });
                }
                exports2.setProtectedValues = setProtectedValues;
                function updateProtectedValuesSalt(node, protectSaltGenerator) {
                  traverse(node, (node2) => {
                    if (strToBoolean(node2.getAttribute(XmlNames.Attr.Protected)) && node2.protectedValue) {
                      const newSalt = protectSaltGenerator.getSalt(node2.protectedValue.byteLength);
                      node2.protectedValue.setSalt(newSalt);
                      node2.textContent = node2.protectedValue.toString();
                    }
                  });
                }
                exports2.updateProtectedValuesSalt = updateProtectedValuesSalt;
                function unprotectValues(node) {
                  traverse(node, (node2) => {
                    if (strToBoolean(node2.getAttribute(XmlNames.Attr.Protected)) && node2.protectedValue) {
                      node2.removeAttribute(XmlNames.Attr.Protected);
                      node2.setAttribute(XmlNames.Attr.ProtectedInMemPlainXml, "True");
                      node2.textContent = node2.protectedValue.getText();
                    }
                  });
                }
                exports2.unprotectValues = unprotectValues;
                function protectUnprotectedValues(node) {
                  traverse(node, (node2) => {
                    if (strToBoolean(node2.getAttribute(XmlNames.Attr.ProtectedInMemPlainXml)) && node2.protectedValue) {
                      node2.removeAttribute(XmlNames.Attr.ProtectedInMemPlainXml);
                      node2.setAttribute(XmlNames.Attr.Protected, "True");
                      node2.textContent = node2.protectedValue.toString();
                    }
                  });
                }
                exports2.protectUnprotectedValues = protectUnprotectedValues;
                function protectPlainValues(node) {
                  traverse(node, (node2) => {
                    if (strToBoolean(node2.getAttribute(XmlNames.Attr.ProtectedInMemPlainXml))) {
                      node2.protectedValue = protected_value_1.ProtectedValue.fromString(node2.textContent || "");
                      node2.textContent = node2.protectedValue.toString();
                      node2.removeAttribute(XmlNames.Attr.ProtectedInMemPlainXml);
                      node2.setAttribute(XmlNames.Attr.Protected, "True");
                    }
                  });
                }
                exports2.protectPlainValues = protectPlainValues;
              })
            ),
            /***/
            "@xmldom/xmldom": (
              /*!*********************************!*\
                !*** external "@xmldom/xmldom" ***!
                \*********************************/
              /***/
              ((module2) => {
                module2.exports = __WEBPACK_EXTERNAL_MODULE__xmldom_xmldom__;
              })
            ),
            /***/
            "crypto": (
              /*!*************************!*\
                !*** external "crypto" ***!
                \*************************/
              /***/
              ((module2) => {
                module2.exports = __WEBPACK_EXTERNAL_MODULE_crypto__;
              })
            ),
            /***/
            "../node_modules/fflate/lib/index.cjs": (
              /*!********************************************!*\
                !*** ../node_modules/fflate/lib/index.cjs ***!
                \********************************************/
              /***/
              ((__unused_webpack_module, exports2, __webpack_require__2) => {
                var node_worker_1 = __webpack_require__2(
                  /*! ./node-worker.cjs */
                  "../node_modules/fflate/lib/worker.cjs"
                );
                var u8 = Uint8Array, u16 = Uint16Array, u322 = Uint32Array;
                var fleb = new u8([
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  1,
                  1,
                  1,
                  1,
                  2,
                  2,
                  2,
                  2,
                  3,
                  3,
                  3,
                  3,
                  4,
                  4,
                  4,
                  4,
                  5,
                  5,
                  5,
                  5,
                  0,
                  /* unused */
                  0,
                  0,
                  /* impossible */
                  0
                ]);
                var fdeb = new u8([
                  0,
                  0,
                  0,
                  0,
                  1,
                  1,
                  2,
                  2,
                  3,
                  3,
                  4,
                  4,
                  5,
                  5,
                  6,
                  6,
                  7,
                  7,
                  8,
                  8,
                  9,
                  9,
                  10,
                  10,
                  11,
                  11,
                  12,
                  12,
                  13,
                  13,
                  /* unused */
                  0,
                  0
                ]);
                var clim = new u8([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
                var freb = function(eb, start) {
                  var b = new u16(31);
                  for (var i2 = 0; i2 < 31; ++i2) {
                    b[i2] = start += 1 << eb[i2 - 1];
                  }
                  var r = new u322(b[30]);
                  for (var i2 = 1; i2 < 30; ++i2) {
                    for (var j = b[i2]; j < b[i2 + 1]; ++j) {
                      r[j] = j - b[i2] << 5 | i2;
                    }
                  }
                  return [b, r];
                };
                var _a2 = freb(fleb, 2), fl = _a2[0], revfl = _a2[1];
                fl[28] = 258, revfl[258] = 28;
                var _b = freb(fdeb, 0), fd = _b[0], revfd = _b[1];
                var rev = new u16(32768);
                for (var i = 0; i < 32768; ++i) {
                  var x = (i & 43690) >>> 1 | (i & 21845) << 1;
                  x = (x & 52428) >>> 2 | (x & 13107) << 2;
                  x = (x & 61680) >>> 4 | (x & 3855) << 4;
                  rev[i] = ((x & 65280) >>> 8 | (x & 255) << 8) >>> 1;
                }
                var hMap = (function(cd, mb, r) {
                  var s = cd.length;
                  var i2 = 0;
                  var l = new u16(mb);
                  for (; i2 < s; ++i2)
                    ++l[cd[i2] - 1];
                  var le = new u16(mb);
                  for (i2 = 0; i2 < mb; ++i2) {
                    le[i2] = le[i2 - 1] + l[i2 - 1] << 1;
                  }
                  var co;
                  if (r) {
                    co = new u16(1 << mb);
                    var rvb = 15 - mb;
                    for (i2 = 0; i2 < s; ++i2) {
                      if (cd[i2]) {
                        var sv = i2 << 4 | cd[i2];
                        var r_1 = mb - cd[i2];
                        var v = le[cd[i2] - 1]++ << r_1;
                        for (var m = v | (1 << r_1) - 1; v <= m; ++v) {
                          co[rev[v] >>> rvb] = sv;
                        }
                      }
                    }
                  } else {
                    co = new u16(s);
                    for (i2 = 0; i2 < s; ++i2) {
                      if (cd[i2]) {
                        co[i2] = rev[le[cd[i2] - 1]++] >>> 15 - cd[i2];
                      }
                    }
                  }
                  return co;
                });
                var flt = new u8(288);
                for (var i = 0; i < 144; ++i)
                  flt[i] = 8;
                for (var i = 144; i < 256; ++i)
                  flt[i] = 9;
                for (var i = 256; i < 280; ++i)
                  flt[i] = 7;
                for (var i = 280; i < 288; ++i)
                  flt[i] = 8;
                var fdt = new u8(32);
                for (var i = 0; i < 32; ++i)
                  fdt[i] = 5;
                var flm = /* @__PURE__ */ hMap(flt, 9, 0), flrm = /* @__PURE__ */ hMap(flt, 9, 1);
                var fdm = /* @__PURE__ */ hMap(fdt, 5, 0), fdrm = /* @__PURE__ */ hMap(fdt, 5, 1);
                var max = function(a) {
                  var m = a[0];
                  for (var i2 = 1; i2 < a.length; ++i2) {
                    if (a[i2] > m)
                      m = a[i2];
                  }
                  return m;
                };
                var bits = function(d, p, m) {
                  var o = p / 8 | 0;
                  return (d[o] | d[o + 1] << 8) >> (p & 7) & m;
                };
                var bits16 = function(d, p) {
                  var o = p / 8 | 0;
                  return (d[o] | d[o + 1] << 8 | d[o + 2] << 16) >> (p & 7);
                };
                var shft = function(p) {
                  return (p + 7) / 8 | 0;
                };
                var slc = function(v, s, e) {
                  if (s == null || s < 0)
                    s = 0;
                  if (e == null || e > v.length)
                    e = v.length;
                  var n = new (v instanceof u16 ? u16 : v instanceof u322 ? u322 : u8)(e - s);
                  n.set(v.subarray(s, e));
                  return n;
                };
                exports2.FlateErrorCode = {
                  UnexpectedEOF: 0,
                  InvalidBlockType: 1,
                  InvalidLengthLiteral: 2,
                  InvalidDistance: 3,
                  StreamFinished: 4,
                  NoStreamHandler: 5,
                  InvalidHeader: 6,
                  NoCallback: 7,
                  InvalidUTF8: 8,
                  ExtraFieldTooLong: 9,
                  InvalidDate: 10,
                  FilenameTooLong: 11,
                  StreamFinishing: 12,
                  InvalidZipData: 13,
                  UnknownCompressionMethod: 14
                };
                var ec = [
                  "unexpected EOF",
                  "invalid block type",
                  "invalid length/literal",
                  "invalid distance",
                  "stream finished",
                  "no stream handler",
                  ,
                  "no callback",
                  "invalid UTF-8 data",
                  "extra field too long",
                  "date not in range 1980-2099",
                  "filename too long",
                  "stream finishing",
                  "invalid zip data"
                  // determined by unknown compression method
                ];
                ;
                var err = function(ind, msg, nt) {
                  var e = new Error(msg || ec[ind]);
                  e.code = ind;
                  if (Error.captureStackTrace)
                    Error.captureStackTrace(e, err);
                  if (!nt)
                    throw e;
                  return e;
                };
                var inflt = function(dat, buf, st) {
                  var sl = dat.length;
                  if (!sl || st && st.f && !st.l)
                    return buf || new u8(0);
                  var noBuf = !buf || st;
                  var noSt = !st || st.i;
                  if (!st)
                    st = {};
                  if (!buf)
                    buf = new u8(sl * 3);
                  var cbuf = function(l2) {
                    var bl = buf.length;
                    if (l2 > bl) {
                      var nbuf = new u8(Math.max(bl * 2, l2));
                      nbuf.set(buf);
                      buf = nbuf;
                    }
                  };
                  var final = st.f || 0, pos = st.p || 0, bt = st.b || 0, lm = st.l, dm = st.d, lbt = st.m, dbt = st.n;
                  var tbts = sl * 8;
                  do {
                    if (!lm) {
                      final = bits(dat, pos, 1);
                      var type = bits(dat, pos + 1, 3);
                      pos += 3;
                      if (!type) {
                        var s = shft(pos) + 4, l = dat[s - 4] | dat[s - 3] << 8, t = s + l;
                        if (t > sl) {
                          if (noSt)
                            err(0);
                          break;
                        }
                        if (noBuf)
                          cbuf(bt + l);
                        buf.set(dat.subarray(s, t), bt);
                        st.b = bt += l, st.p = pos = t * 8, st.f = final;
                        continue;
                      } else if (type == 1)
                        lm = flrm, dm = fdrm, lbt = 9, dbt = 5;
                      else if (type == 2) {
                        var hLit = bits(dat, pos, 31) + 257, hcLen = bits(dat, pos + 10, 15) + 4;
                        var tl = hLit + bits(dat, pos + 5, 31) + 1;
                        pos += 14;
                        var ldt = new u8(tl);
                        var clt = new u8(19);
                        for (var i2 = 0; i2 < hcLen; ++i2) {
                          clt[clim[i2]] = bits(dat, pos + i2 * 3, 7);
                        }
                        pos += hcLen * 3;
                        var clb = max(clt), clbmsk = (1 << clb) - 1;
                        var clm = hMap(clt, clb, 1);
                        for (var i2 = 0; i2 < tl; ) {
                          var r = clm[bits(dat, pos, clbmsk)];
                          pos += r & 15;
                          var s = r >>> 4;
                          if (s < 16) {
                            ldt[i2++] = s;
                          } else {
                            var c = 0, n = 0;
                            if (s == 16)
                              n = 3 + bits(dat, pos, 3), pos += 2, c = ldt[i2 - 1];
                            else if (s == 17)
                              n = 3 + bits(dat, pos, 7), pos += 3;
                            else if (s == 18)
                              n = 11 + bits(dat, pos, 127), pos += 7;
                            while (n--)
                              ldt[i2++] = c;
                          }
                        }
                        var lt = ldt.subarray(0, hLit), dt = ldt.subarray(hLit);
                        lbt = max(lt);
                        dbt = max(dt);
                        lm = hMap(lt, lbt, 1);
                        dm = hMap(dt, dbt, 1);
                      } else
                        err(1);
                      if (pos > tbts) {
                        if (noSt)
                          err(0);
                        break;
                      }
                    }
                    if (noBuf)
                      cbuf(bt + 131072);
                    var lms = (1 << lbt) - 1, dms = (1 << dbt) - 1;
                    var lpos = pos;
                    for (; ; lpos = pos) {
                      var c = lm[bits16(dat, pos) & lms], sym = c >>> 4;
                      pos += c & 15;
                      if (pos > tbts) {
                        if (noSt)
                          err(0);
                        break;
                      }
                      if (!c)
                        err(2);
                      if (sym < 256)
                        buf[bt++] = sym;
                      else if (sym == 256) {
                        lpos = pos, lm = null;
                        break;
                      } else {
                        var add2 = sym - 254;
                        if (sym > 264) {
                          var i2 = sym - 257, b = fleb[i2];
                          add2 = bits(dat, pos, (1 << b) - 1) + fl[i2];
                          pos += b;
                        }
                        var d = dm[bits16(dat, pos) & dms], dsym = d >>> 4;
                        if (!d)
                          err(3);
                        pos += d & 15;
                        var dt = fd[dsym];
                        if (dsym > 3) {
                          var b = fdeb[dsym];
                          dt += bits16(dat, pos) & (1 << b) - 1, pos += b;
                        }
                        if (pos > tbts) {
                          if (noSt)
                            err(0);
                          break;
                        }
                        if (noBuf)
                          cbuf(bt + 131072);
                        var end = bt + add2;
                        for (; bt < end; bt += 4) {
                          buf[bt] = buf[bt - dt];
                          buf[bt + 1] = buf[bt + 1 - dt];
                          buf[bt + 2] = buf[bt + 2 - dt];
                          buf[bt + 3] = buf[bt + 3 - dt];
                        }
                        bt = end;
                      }
                    }
                    st.l = lm, st.p = lpos, st.b = bt, st.f = final;
                    if (lm)
                      final = 1, st.m = lbt, st.d = dm, st.n = dbt;
                  } while (!final);
                  return bt == buf.length ? buf : slc(buf, 0, bt);
                };
                var wbits = function(d, p, v) {
                  v <<= p & 7;
                  var o = p / 8 | 0;
                  d[o] |= v;
                  d[o + 1] |= v >>> 8;
                };
                var wbits16 = function(d, p, v) {
                  v <<= p & 7;
                  var o = p / 8 | 0;
                  d[o] |= v;
                  d[o + 1] |= v >>> 8;
                  d[o + 2] |= v >>> 16;
                };
                var hTree = function(d, mb) {
                  var t = [];
                  for (var i2 = 0; i2 < d.length; ++i2) {
                    if (d[i2])
                      t.push({ s: i2, f: d[i2] });
                  }
                  var s = t.length;
                  var t2 = t.slice();
                  if (!s)
                    return [et, 0];
                  if (s == 1) {
                    var v = new u8(t[0].s + 1);
                    v[t[0].s] = 1;
                    return [v, 1];
                  }
                  t.sort(function(a, b) {
                    return a.f - b.f;
                  });
                  t.push({ s: -1, f: 25001 });
                  var l = t[0], r = t[1], i0 = 0, i1 = 1, i22 = 2;
                  t[0] = { s: -1, f: l.f + r.f, l, r };
                  while (i1 != s - 1) {
                    l = t[t[i0].f < t[i22].f ? i0++ : i22++];
                    r = t[i0 != i1 && t[i0].f < t[i22].f ? i0++ : i22++];
                    t[i1++] = { s: -1, f: l.f + r.f, l, r };
                  }
                  var maxSym = t2[0].s;
                  for (var i2 = 1; i2 < s; ++i2) {
                    if (t2[i2].s > maxSym)
                      maxSym = t2[i2].s;
                  }
                  var tr = new u16(maxSym + 1);
                  var mbt = ln(t[i1 - 1], tr, 0);
                  if (mbt > mb) {
                    var i2 = 0, dt = 0;
                    var lft = mbt - mb, cst = 1 << lft;
                    t2.sort(function(a, b) {
                      return tr[b.s] - tr[a.s] || a.f - b.f;
                    });
                    for (; i2 < s; ++i2) {
                      var i2_1 = t2[i2].s;
                      if (tr[i2_1] > mb) {
                        dt += cst - (1 << mbt - tr[i2_1]);
                        tr[i2_1] = mb;
                      } else
                        break;
                    }
                    dt >>>= lft;
                    while (dt > 0) {
                      var i2_2 = t2[i2].s;
                      if (tr[i2_2] < mb)
                        dt -= 1 << mb - tr[i2_2]++ - 1;
                      else
                        ++i2;
                    }
                    for (; i2 >= 0 && dt; --i2) {
                      var i2_3 = t2[i2].s;
                      if (tr[i2_3] == mb) {
                        --tr[i2_3];
                        ++dt;
                      }
                    }
                    mbt = mb;
                  }
                  return [new u8(tr), mbt];
                };
                var ln = function(n, l, d) {
                  return n.s == -1 ? Math.max(ln(n.l, l, d + 1), ln(n.r, l, d + 1)) : l[n.s] = d;
                };
                var lc = function(c) {
                  var s = c.length;
                  while (s && !c[--s])
                    ;
                  var cl = new u16(++s);
                  var cli = 0, cln = c[0], cls = 1;
                  var w = function(v) {
                    cl[cli++] = v;
                  };
                  for (var i2 = 1; i2 <= s; ++i2) {
                    if (c[i2] == cln && i2 != s)
                      ++cls;
                    else {
                      if (!cln && cls > 2) {
                        for (; cls > 138; cls -= 138)
                          w(32754);
                        if (cls > 2) {
                          w(cls > 10 ? cls - 11 << 5 | 28690 : cls - 3 << 5 | 12305);
                          cls = 0;
                        }
                      } else if (cls > 3) {
                        w(cln), --cls;
                        for (; cls > 6; cls -= 6)
                          w(8304);
                        if (cls > 2)
                          w(cls - 3 << 5 | 8208), cls = 0;
                      }
                      while (cls--)
                        w(cln);
                      cls = 1;
                      cln = c[i2];
                    }
                  }
                  return [cl.subarray(0, cli), s];
                };
                var clen = function(cf, cl) {
                  var l = 0;
                  for (var i2 = 0; i2 < cl.length; ++i2)
                    l += cf[i2] * cl[i2];
                  return l;
                };
                var wfblk = function(out, pos, dat) {
                  var s = dat.length;
                  var o = shft(pos + 2);
                  out[o] = s & 255;
                  out[o + 1] = s >>> 8;
                  out[o + 2] = out[o] ^ 255;
                  out[o + 3] = out[o + 1] ^ 255;
                  for (var i2 = 0; i2 < s; ++i2)
                    out[o + i2 + 4] = dat[i2];
                  return (o + 4 + s) * 8;
                };
                var wblk = function(dat, out, final, syms, lf, df, eb, li, bs, bl, p) {
                  wbits(out, p++, final);
                  ++lf[256];
                  var _a3 = hTree(lf, 15), dlt = _a3[0], mlb = _a3[1];
                  var _b2 = hTree(df, 15), ddt = _b2[0], mdb = _b2[1];
                  var _c = lc(dlt), lclt = _c[0], nlc = _c[1];
                  var _d = lc(ddt), lcdt = _d[0], ndc = _d[1];
                  var lcfreq = new u16(19);
                  for (var i2 = 0; i2 < lclt.length; ++i2)
                    lcfreq[lclt[i2] & 31]++;
                  for (var i2 = 0; i2 < lcdt.length; ++i2)
                    lcfreq[lcdt[i2] & 31]++;
                  var _e = hTree(lcfreq, 7), lct = _e[0], mlcb = _e[1];
                  var nlcc = 19;
                  for (; nlcc > 4 && !lct[clim[nlcc - 1]]; --nlcc)
                    ;
                  var flen = bl + 5 << 3;
                  var ftlen = clen(lf, flt) + clen(df, fdt) + eb;
                  var dtlen = clen(lf, dlt) + clen(df, ddt) + eb + 14 + 3 * nlcc + clen(lcfreq, lct) + (2 * lcfreq[16] + 3 * lcfreq[17] + 7 * lcfreq[18]);
                  if (flen <= ftlen && flen <= dtlen)
                    return wfblk(out, p, dat.subarray(bs, bs + bl));
                  var lm, ll, dm, dl;
                  wbits(out, p, 1 + (dtlen < ftlen)), p += 2;
                  if (dtlen < ftlen) {
                    lm = hMap(dlt, mlb, 0), ll = dlt, dm = hMap(ddt, mdb, 0), dl = ddt;
                    var llm = hMap(lct, mlcb, 0);
                    wbits(out, p, nlc - 257);
                    wbits(out, p + 5, ndc - 1);
                    wbits(out, p + 10, nlcc - 4);
                    p += 14;
                    for (var i2 = 0; i2 < nlcc; ++i2)
                      wbits(out, p + 3 * i2, lct[clim[i2]]);
                    p += 3 * nlcc;
                    var lcts = [lclt, lcdt];
                    for (var it = 0; it < 2; ++it) {
                      var clct = lcts[it];
                      for (var i2 = 0; i2 < clct.length; ++i2) {
                        var len = clct[i2] & 31;
                        wbits(out, p, llm[len]), p += lct[len];
                        if (len > 15)
                          wbits(out, p, clct[i2] >>> 5 & 127), p += clct[i2] >>> 12;
                      }
                    }
                  } else {
                    lm = flm, ll = flt, dm = fdm, dl = fdt;
                  }
                  for (var i2 = 0; i2 < li; ++i2) {
                    if (syms[i2] > 255) {
                      var len = syms[i2] >>> 18 & 31;
                      wbits16(out, p, lm[len + 257]), p += ll[len + 257];
                      if (len > 7)
                        wbits(out, p, syms[i2] >>> 23 & 31), p += fleb[len];
                      var dst = syms[i2] & 31;
                      wbits16(out, p, dm[dst]), p += dl[dst];
                      if (dst > 3)
                        wbits16(out, p, syms[i2] >>> 5 & 8191), p += fdeb[dst];
                    } else {
                      wbits16(out, p, lm[syms[i2]]), p += ll[syms[i2]];
                    }
                  }
                  wbits16(out, p, lm[256]);
                  return p + ll[256];
                };
                var deo = /* @__PURE__ */ new u322([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]);
                var et = /* @__PURE__ */ new u8(0);
                var dflt = function(dat, lvl, plvl, pre, post, lst) {
                  var s = dat.length;
                  var o = new u8(pre + s + 5 * (1 + Math.ceil(s / 7e3)) + post);
                  var w = o.subarray(pre, o.length - post);
                  var pos = 0;
                  if (!lvl || s < 8) {
                    for (var i2 = 0; i2 <= s; i2 += 65535) {
                      var e = i2 + 65535;
                      if (e < s) {
                        pos = wfblk(w, pos, dat.subarray(i2, e));
                      } else {
                        w[i2] = lst;
                        pos = wfblk(w, pos, dat.subarray(i2, s));
                      }
                    }
                  } else {
                    var opt = deo[lvl - 1];
                    var n = opt >>> 13, c = opt & 8191;
                    var msk_1 = (1 << plvl) - 1;
                    var prev = new u16(32768), head = new u16(msk_1 + 1);
                    var bs1_1 = Math.ceil(plvl / 3), bs2_1 = 2 * bs1_1;
                    var hsh = function(i3) {
                      return (dat[i3] ^ dat[i3 + 1] << bs1_1 ^ dat[i3 + 2] << bs2_1) & msk_1;
                    };
                    var syms = new u322(25e3);
                    var lf = new u16(288), df = new u16(32);
                    var lc_1 = 0, eb = 0, i2 = 0, li = 0, wi = 0, bs = 0;
                    for (; i2 < s; ++i2) {
                      var hv = hsh(i2);
                      var imod = i2 & 32767, pimod = head[hv];
                      prev[imod] = pimod;
                      head[hv] = imod;
                      if (wi <= i2) {
                        var rem = s - i2;
                        if ((lc_1 > 7e3 || li > 24576) && rem > 423) {
                          pos = wblk(dat, w, 0, syms, lf, df, eb, li, bs, i2 - bs, pos);
                          li = lc_1 = eb = 0, bs = i2;
                          for (var j = 0; j < 286; ++j)
                            lf[j] = 0;
                          for (var j = 0; j < 30; ++j)
                            df[j] = 0;
                        }
                        var l = 2, d = 0, ch_1 = c, dif = imod - pimod & 32767;
                        if (rem > 2 && hv == hsh(i2 - dif)) {
                          var maxn = Math.min(n, rem) - 1;
                          var maxd = Math.min(32767, i2);
                          var ml = Math.min(258, rem);
                          while (dif <= maxd && --ch_1 && imod != pimod) {
                            if (dat[i2 + l] == dat[i2 + l - dif]) {
                              var nl = 0;
                              for (; nl < ml && dat[i2 + nl] == dat[i2 + nl - dif]; ++nl)
                                ;
                              if (nl > l) {
                                l = nl, d = dif;
                                if (nl > maxn)
                                  break;
                                var mmd = Math.min(dif, nl - 2);
                                var md = 0;
                                for (var j = 0; j < mmd; ++j) {
                                  var ti = i2 - dif + j + 32768 & 32767;
                                  var pti = prev[ti];
                                  var cd = ti - pti + 32768 & 32767;
                                  if (cd > md)
                                    md = cd, pimod = ti;
                                }
                              }
                            }
                            imod = pimod, pimod = prev[imod];
                            dif += imod - pimod + 32768 & 32767;
                          }
                        }
                        if (d) {
                          syms[li++] = 268435456 | revfl[l] << 18 | revfd[d];
                          var lin = revfl[l] & 31, din = revfd[d] & 31;
                          eb += fleb[lin] + fdeb[din];
                          ++lf[257 + lin];
                          ++df[din];
                          wi = i2 + l;
                          ++lc_1;
                        } else {
                          syms[li++] = dat[i2];
                          ++lf[dat[i2]];
                        }
                      }
                    }
                    pos = wblk(dat, w, lst, syms, lf, df, eb, li, bs, i2 - bs, pos);
                    if (!lst && pos & 7)
                      pos = wfblk(w, pos + 1, et);
                  }
                  return slc(o, 0, pre + shft(pos) + post);
                };
                var crct = /* @__PURE__ */ (function() {
                  var t = new Int32Array(256);
                  for (var i2 = 0; i2 < 256; ++i2) {
                    var c = i2, k = 9;
                    while (--k)
                      c = (c & 1 && -306674912) ^ c >>> 1;
                    t[i2] = c;
                  }
                  return t;
                })();
                var crc = function() {
                  var c = -1;
                  return {
                    p: function(d) {
                      var cr = c;
                      for (var i2 = 0; i2 < d.length; ++i2)
                        cr = crct[cr & 255 ^ d[i2]] ^ cr >>> 8;
                      c = cr;
                    },
                    d: function() {
                      return ~c;
                    }
                  };
                };
                var adler = function() {
                  var a = 1, b = 0;
                  return {
                    p: function(d) {
                      var n = a, m = b;
                      var l = d.length | 0;
                      for (var i2 = 0; i2 != l; ) {
                        var e = Math.min(i2 + 2655, l);
                        for (; i2 < e; ++i2)
                          m += n += d[i2];
                        n = (n & 65535) + 15 * (n >> 16), m = (m & 65535) + 15 * (m >> 16);
                      }
                      a = n, b = m;
                    },
                    d: function() {
                      a %= 65521, b %= 65521;
                      return (a & 255) << 24 | a >>> 8 << 16 | (b & 255) << 8 | b >>> 8;
                    }
                  };
                };
                ;
                var dopt = function(dat, opt, pre, post, st) {
                  return dflt(dat, opt.level == null ? 6 : opt.level, opt.mem == null ? Math.ceil(Math.max(8, Math.min(13, Math.log(dat.length))) * 1.5) : 12 + opt.mem, pre, post, !st);
                };
                var mrg = function(a, b) {
                  var o = {};
                  for (var k in a)
                    o[k] = a[k];
                  for (var k in b)
                    o[k] = b[k];
                  return o;
                };
                var wcln = function(fn, fnStr, td2) {
                  var dt = fn();
                  var st = fn.toString();
                  var ks = st.slice(st.indexOf("[") + 1, st.lastIndexOf("]")).replace(/ /g, "").split(",");
                  for (var i2 = 0; i2 < dt.length; ++i2) {
                    var v = dt[i2], k = ks[i2];
                    if (typeof v == "function") {
                      fnStr += ";" + k + "=";
                      var st_1 = v.toString();
                      if (v.prototype) {
                        if (st_1.indexOf("[native code]") != -1) {
                          var spInd = st_1.indexOf(" ", 8) + 1;
                          fnStr += st_1.slice(spInd, st_1.indexOf("(", spInd));
                        } else {
                          fnStr += st_1;
                          for (var t in v.prototype)
                            fnStr += ";" + k + ".prototype." + t + "=" + v.prototype[t].toString();
                        }
                      } else
                        fnStr += st_1;
                    } else
                      td2[k] = v;
                  }
                  return [fnStr, td2];
                };
                var ch = [];
                var cbfs = function(v) {
                  var tl = [];
                  for (var k in v) {
                    if (v[k] instanceof u8 || v[k] instanceof u16 || v[k] instanceof u322)
                      tl.push((v[k] = new v[k].constructor(v[k])).buffer);
                  }
                  return tl;
                };
                var wrkr = function(fns, init, id, cb) {
                  var _a3;
                  if (!ch[id]) {
                    var fnStr = "", td_1 = {}, m = fns.length - 1;
                    for (var i2 = 0; i2 < m; ++i2)
                      _a3 = wcln(fns[i2], fnStr, td_1), fnStr = _a3[0], td_1 = _a3[1];
                    ch[id] = wcln(fns[m], fnStr, td_1);
                  }
                  var td2 = mrg({}, ch[id][1]);
                  return node_worker_1["default"](ch[id][0] + ";onmessage=function(e){for(var k in e.data)self[k]=e.data[k];onmessage=" + init.toString() + "}", id, td2, cbfs(td2), cb);
                };
                var bInflt = function() {
                  return [u8, u16, u322, fleb, fdeb, clim, fl, fd, flrm, fdrm, rev, ec, hMap, max, bits, bits16, shft, slc, err, inflt, inflateSync, pbf, gu8];
                };
                var bDflt = function() {
                  return [u8, u16, u322, fleb, fdeb, clim, revfl, revfd, flm, flt, fdm, fdt, rev, deo, et, hMap, wbits, wbits16, hTree, ln, lc, clen, wfblk, wblk, shft, slc, dflt, dopt, deflateSync, pbf];
                };
                var gze = function() {
                  return [gzh, gzhl, wbytes, crc, crct];
                };
                var guze = function() {
                  return [gzs, gzl];
                };
                var zle = function() {
                  return [zlh, wbytes, adler];
                };
                var zule = function() {
                  return [zlv];
                };
                var pbf = function(msg) {
                  return postMessage(msg, [msg.buffer]);
                };
                var gu8 = function(o) {
                  return o && o.size && new u8(o.size);
                };
                var cbify = function(dat, opts, fns, init, id, cb) {
                  var w = wrkr(fns, init, id, function(err2, dat2) {
                    w.terminate();
                    cb(err2, dat2);
                  });
                  w.postMessage([dat, opts], opts.consume ? [dat.buffer] : []);
                  return function() {
                    w.terminate();
                  };
                };
                var astrm = function(strm) {
                  strm.ondata = function(dat, final) {
                    return postMessage([dat, final], [dat.buffer]);
                  };
                  return function(ev) {
                    return strm.push(ev.data[0], ev.data[1]);
                  };
                };
                var astrmify = function(fns, strm, opts, init, id) {
                  var t;
                  var w = wrkr(fns, init, id, function(err2, dat) {
                    if (err2)
                      w.terminate(), strm.ondata.call(strm, err2);
                    else {
                      if (dat[1])
                        w.terminate();
                      strm.ondata.call(strm, err2, dat[0], dat[1]);
                    }
                  });
                  w.postMessage(opts);
                  strm.push = function(d, f) {
                    if (!strm.ondata)
                      err(5);
                    if (t)
                      strm.ondata(err(4, 0, 1), null, !!f);
                    w.postMessage([d, t = f], [d.buffer]);
                  };
                  strm.terminate = function() {
                    w.terminate();
                  };
                };
                var b2 = function(d, b) {
                  return d[b] | d[b + 1] << 8;
                };
                var b4 = function(d, b) {
                  return (d[b] | d[b + 1] << 8 | d[b + 2] << 16 | d[b + 3] << 24) >>> 0;
                };
                var b8 = function(d, b) {
                  return b4(d, b) + b4(d, b + 4) * 4294967296;
                };
                var wbytes = function(d, b, v) {
                  for (; v; ++b)
                    d[b] = v, v >>>= 8;
                };
                var gzh = function(c, o) {
                  var fn = o.filename;
                  c[0] = 31, c[1] = 139, c[2] = 8, c[8] = o.level < 2 ? 4 : o.level == 9 ? 2 : 0, c[9] = 3;
                  if (o.mtime != 0)
                    wbytes(c, 4, Math.floor(new Date(o.mtime || Date.now()) / 1e3));
                  if (fn) {
                    c[3] = 8;
                    for (var i2 = 0; i2 <= fn.length; ++i2)
                      c[i2 + 10] = fn.charCodeAt(i2);
                  }
                };
                var gzs = function(d) {
                  if (d[0] != 31 || d[1] != 139 || d[2] != 8)
                    err(6, "invalid gzip data");
                  var flg = d[3];
                  var st = 10;
                  if (flg & 4)
                    st += d[10] | (d[11] << 8) + 2;
                  for (var zs = (flg >> 3 & 1) + (flg >> 4 & 1); zs > 0; zs -= !d[st++])
                    ;
                  return st + (flg & 2);
                };
                var gzl = function(d) {
                  var l = d.length;
                  return (d[l - 4] | d[l - 3] << 8 | d[l - 2] << 16 | d[l - 1] << 24) >>> 0;
                };
                var gzhl = function(o) {
                  return 10 + (o.filename && o.filename.length + 1 || 0);
                };
                var zlh = function(c, o) {
                  var lv = o.level, fl2 = lv == 0 ? 0 : lv < 6 ? 1 : lv == 9 ? 3 : 2;
                  c[0] = 120, c[1] = fl2 << 6 | (fl2 ? 32 - 2 * fl2 : 1);
                };
                var zlv = function(d) {
                  if ((d[0] & 15) != 8 || d[0] >>> 4 > 7 || (d[0] << 8 | d[1]) % 31)
                    err(6, "invalid zlib data");
                  if (d[1] & 32)
                    err(6, "invalid zlib data: preset dictionaries not supported");
                };
                function AsyncCmpStrm(opts, cb) {
                  if (!cb && typeof opts == "function")
                    cb = opts, opts = {};
                  this.ondata = cb;
                  return opts;
                }
                var Deflate = /* @__PURE__ */ (function() {
                  function Deflate2(opts, cb) {
                    if (!cb && typeof opts == "function")
                      cb = opts, opts = {};
                    this.ondata = cb;
                    this.o = opts || {};
                  }
                  Deflate2.prototype.p = function(c, f) {
                    this.ondata(dopt(c, this.o, 0, 0, !f), f);
                  };
                  Deflate2.prototype.push = function(chunk, final) {
                    if (!this.ondata)
                      err(5);
                    if (this.d)
                      err(4);
                    this.d = final;
                    this.p(chunk, final || false);
                  };
                  return Deflate2;
                })();
                exports2.Deflate = Deflate;
                var AsyncDeflate = /* @__PURE__ */ (function() {
                  function AsyncDeflate2(opts, cb) {
                    astrmify([
                      bDflt,
                      function() {
                        return [astrm, Deflate];
                      }
                    ], this, AsyncCmpStrm.call(this, opts, cb), function(ev) {
                      var strm = new Deflate(ev.data);
                      onmessage = astrm(strm);
                    }, 6);
                  }
                  return AsyncDeflate2;
                })();
                exports2.AsyncDeflate = AsyncDeflate;
                function deflate(data2, opts, cb) {
                  if (!cb)
                    cb = opts, opts = {};
                  if (typeof cb != "function")
                    err(7);
                  return cbify(data2, opts, [
                    bDflt
                  ], function(ev) {
                    return pbf(deflateSync(ev.data[0], ev.data[1]));
                  }, 0, cb);
                }
                exports2.deflate = deflate;
                function deflateSync(data2, opts) {
                  return dopt(data2, opts || {}, 0, 0);
                }
                exports2.deflateSync = deflateSync;
                var Inflate = /* @__PURE__ */ (function() {
                  function Inflate2(cb) {
                    this.s = {};
                    this.p = new u8(0);
                    this.ondata = cb;
                  }
                  Inflate2.prototype.e = function(c) {
                    if (!this.ondata)
                      err(5);
                    if (this.d)
                      err(4);
                    var l = this.p.length;
                    var n = new u8(l + c.length);
                    n.set(this.p), n.set(c, l), this.p = n;
                  };
                  Inflate2.prototype.c = function(final) {
                    this.d = this.s.i = final || false;
                    var bts = this.s.b;
                    var dt = inflt(this.p, this.o, this.s);
                    this.ondata(slc(dt, bts, this.s.b), this.d);
                    this.o = slc(dt, this.s.b - 32768), this.s.b = this.o.length;
                    this.p = slc(this.p, this.s.p / 8 | 0), this.s.p &= 7;
                  };
                  Inflate2.prototype.push = function(chunk, final) {
                    this.e(chunk), this.c(final);
                  };
                  return Inflate2;
                })();
                exports2.Inflate = Inflate;
                var AsyncInflate = /* @__PURE__ */ (function() {
                  function AsyncInflate2(cb) {
                    this.ondata = cb;
                    astrmify([
                      bInflt,
                      function() {
                        return [astrm, Inflate];
                      }
                    ], this, 0, function() {
                      var strm = new Inflate();
                      onmessage = astrm(strm);
                    }, 7);
                  }
                  return AsyncInflate2;
                })();
                exports2.AsyncInflate = AsyncInflate;
                function inflate(data2, opts, cb) {
                  if (!cb)
                    cb = opts, opts = {};
                  if (typeof cb != "function")
                    err(7);
                  return cbify(data2, opts, [
                    bInflt
                  ], function(ev) {
                    return pbf(inflateSync(ev.data[0], gu8(ev.data[1])));
                  }, 1, cb);
                }
                exports2.inflate = inflate;
                function inflateSync(data2, out) {
                  return inflt(data2, out);
                }
                exports2.inflateSync = inflateSync;
                var Gzip = /* @__PURE__ */ (function() {
                  function Gzip2(opts, cb) {
                    this.c = crc();
                    this.l = 0;
                    this.v = 1;
                    Deflate.call(this, opts, cb);
                  }
                  Gzip2.prototype.push = function(chunk, final) {
                    Deflate.prototype.push.call(this, chunk, final);
                  };
                  Gzip2.prototype.p = function(c, f) {
                    this.c.p(c);
                    this.l += c.length;
                    var raw = dopt(c, this.o, this.v && gzhl(this.o), f && 8, !f);
                    if (this.v)
                      gzh(raw, this.o), this.v = 0;
                    if (f)
                      wbytes(raw, raw.length - 8, this.c.d()), wbytes(raw, raw.length - 4, this.l);
                    this.ondata(raw, f);
                  };
                  return Gzip2;
                })();
                exports2.Gzip = Gzip;
                exports2.Compress = Gzip;
                var AsyncGzip = /* @__PURE__ */ (function() {
                  function AsyncGzip2(opts, cb) {
                    astrmify([
                      bDflt,
                      gze,
                      function() {
                        return [astrm, Deflate, Gzip];
                      }
                    ], this, AsyncCmpStrm.call(this, opts, cb), function(ev) {
                      var strm = new Gzip(ev.data);
                      onmessage = astrm(strm);
                    }, 8);
                  }
                  return AsyncGzip2;
                })();
                exports2.AsyncGzip = AsyncGzip;
                exports2.AsyncCompress = AsyncGzip;
                function gzip(data2, opts, cb) {
                  if (!cb)
                    cb = opts, opts = {};
                  if (typeof cb != "function")
                    err(7);
                  return cbify(data2, opts, [
                    bDflt,
                    gze,
                    function() {
                      return [gzipSync];
                    }
                  ], function(ev) {
                    return pbf(gzipSync(ev.data[0], ev.data[1]));
                  }, 2, cb);
                }
                exports2.gzip = gzip;
                exports2.compress = gzip;
                function gzipSync(data2, opts) {
                  if (!opts)
                    opts = {};
                  var c = crc(), l = data2.length;
                  c.p(data2);
                  var d = dopt(data2, opts, gzhl(opts), 8), s = d.length;
                  return gzh(d, opts), wbytes(d, s - 8, c.d()), wbytes(d, s - 4, l), d;
                }
                exports2.gzipSync = gzipSync;
                exports2.compressSync = gzipSync;
                var Gunzip = /* @__PURE__ */ (function() {
                  function Gunzip2(cb) {
                    this.v = 1;
                    Inflate.call(this, cb);
                  }
                  Gunzip2.prototype.push = function(chunk, final) {
                    Inflate.prototype.e.call(this, chunk);
                    if (this.v) {
                      var s = this.p.length > 3 ? gzs(this.p) : 4;
                      if (s >= this.p.length && !final)
                        return;
                      this.p = this.p.subarray(s), this.v = 0;
                    }
                    if (final) {
                      if (this.p.length < 8)
                        err(6, "invalid gzip data");
                      this.p = this.p.subarray(0, -8);
                    }
                    Inflate.prototype.c.call(this, final);
                  };
                  return Gunzip2;
                })();
                exports2.Gunzip = Gunzip;
                var AsyncGunzip = /* @__PURE__ */ (function() {
                  function AsyncGunzip2(cb) {
                    this.ondata = cb;
                    astrmify([
                      bInflt,
                      guze,
                      function() {
                        return [astrm, Inflate, Gunzip];
                      }
                    ], this, 0, function() {
                      var strm = new Gunzip();
                      onmessage = astrm(strm);
                    }, 9);
                  }
                  return AsyncGunzip2;
                })();
                exports2.AsyncGunzip = AsyncGunzip;
                function gunzip(data2, opts, cb) {
                  if (!cb)
                    cb = opts, opts = {};
                  if (typeof cb != "function")
                    err(7);
                  return cbify(data2, opts, [
                    bInflt,
                    guze,
                    function() {
                      return [gunzipSync];
                    }
                  ], function(ev) {
                    return pbf(gunzipSync(ev.data[0]));
                  }, 3, cb);
                }
                exports2.gunzip = gunzip;
                function gunzipSync(data2, out) {
                  return inflt(data2.subarray(gzs(data2), -8), out || new u8(gzl(data2)));
                }
                exports2.gunzipSync = gunzipSync;
                var Zlib = /* @__PURE__ */ (function() {
                  function Zlib2(opts, cb) {
                    this.c = adler();
                    this.v = 1;
                    Deflate.call(this, opts, cb);
                  }
                  Zlib2.prototype.push = function(chunk, final) {
                    Deflate.prototype.push.call(this, chunk, final);
                  };
                  Zlib2.prototype.p = function(c, f) {
                    this.c.p(c);
                    var raw = dopt(c, this.o, this.v && 2, f && 4, !f);
                    if (this.v)
                      zlh(raw, this.o), this.v = 0;
                    if (f)
                      wbytes(raw, raw.length - 4, this.c.d());
                    this.ondata(raw, f);
                  };
                  return Zlib2;
                })();
                exports2.Zlib = Zlib;
                var AsyncZlib = /* @__PURE__ */ (function() {
                  function AsyncZlib2(opts, cb) {
                    astrmify([
                      bDflt,
                      zle,
                      function() {
                        return [astrm, Deflate, Zlib];
                      }
                    ], this, AsyncCmpStrm.call(this, opts, cb), function(ev) {
                      var strm = new Zlib(ev.data);
                      onmessage = astrm(strm);
                    }, 10);
                  }
                  return AsyncZlib2;
                })();
                exports2.AsyncZlib = AsyncZlib;
                function zlib(data2, opts, cb) {
                  if (!cb)
                    cb = opts, opts = {};
                  if (typeof cb != "function")
                    err(7);
                  return cbify(data2, opts, [
                    bDflt,
                    zle,
                    function() {
                      return [zlibSync];
                    }
                  ], function(ev) {
                    return pbf(zlibSync(ev.data[0], ev.data[1]));
                  }, 4, cb);
                }
                exports2.zlib = zlib;
                function zlibSync(data2, opts) {
                  if (!opts)
                    opts = {};
                  var a = adler();
                  a.p(data2);
                  var d = dopt(data2, opts, 2, 4);
                  return zlh(d, opts), wbytes(d, d.length - 4, a.d()), d;
                }
                exports2.zlibSync = zlibSync;
                var Unzlib = /* @__PURE__ */ (function() {
                  function Unzlib2(cb) {
                    this.v = 1;
                    Inflate.call(this, cb);
                  }
                  Unzlib2.prototype.push = function(chunk, final) {
                    Inflate.prototype.e.call(this, chunk);
                    if (this.v) {
                      if (this.p.length < 2 && !final)
                        return;
                      this.p = this.p.subarray(2), this.v = 0;
                    }
                    if (final) {
                      if (this.p.length < 4)
                        err(6, "invalid zlib data");
                      this.p = this.p.subarray(0, -4);
                    }
                    Inflate.prototype.c.call(this, final);
                  };
                  return Unzlib2;
                })();
                exports2.Unzlib = Unzlib;
                var AsyncUnzlib = /* @__PURE__ */ (function() {
                  function AsyncUnzlib2(cb) {
                    this.ondata = cb;
                    astrmify([
                      bInflt,
                      zule,
                      function() {
                        return [astrm, Inflate, Unzlib];
                      }
                    ], this, 0, function() {
                      var strm = new Unzlib();
                      onmessage = astrm(strm);
                    }, 11);
                  }
                  return AsyncUnzlib2;
                })();
                exports2.AsyncUnzlib = AsyncUnzlib;
                function unzlib(data2, opts, cb) {
                  if (!cb)
                    cb = opts, opts = {};
                  if (typeof cb != "function")
                    err(7);
                  return cbify(data2, opts, [
                    bInflt,
                    zule,
                    function() {
                      return [unzlibSync];
                    }
                  ], function(ev) {
                    return pbf(unzlibSync(ev.data[0], gu8(ev.data[1])));
                  }, 5, cb);
                }
                exports2.unzlib = unzlib;
                function unzlibSync(data2, out) {
                  return inflt((zlv(data2), data2.subarray(2, -4)), out);
                }
                exports2.unzlibSync = unzlibSync;
                var Decompress = /* @__PURE__ */ (function() {
                  function Decompress2(cb) {
                    this.G = Gunzip;
                    this.I = Inflate;
                    this.Z = Unzlib;
                    this.ondata = cb;
                  }
                  Decompress2.prototype.push = function(chunk, final) {
                    if (!this.ondata)
                      err(5);
                    if (!this.s) {
                      if (this.p && this.p.length) {
                        var n = new u8(this.p.length + chunk.length);
                        n.set(this.p), n.set(chunk, this.p.length);
                      } else
                        this.p = chunk;
                      if (this.p.length > 2) {
                        var _this_1 = this;
                        var cb = function() {
                          _this_1.ondata.apply(_this_1, arguments);
                        };
                        this.s = this.p[0] == 31 && this.p[1] == 139 && this.p[2] == 8 ? new this.G(cb) : (this.p[0] & 15) != 8 || this.p[0] >> 4 > 7 || (this.p[0] << 8 | this.p[1]) % 31 ? new this.I(cb) : new this.Z(cb);
                        this.s.push(this.p, final);
                        this.p = null;
                      }
                    } else
                      this.s.push(chunk, final);
                  };
                  return Decompress2;
                })();
                exports2.Decompress = Decompress;
                var AsyncDecompress = /* @__PURE__ */ (function() {
                  function AsyncDecompress2(cb) {
                    this.G = AsyncGunzip;
                    this.I = AsyncInflate;
                    this.Z = AsyncUnzlib;
                    this.ondata = cb;
                  }
                  AsyncDecompress2.prototype.push = function(chunk, final) {
                    Decompress.prototype.push.call(this, chunk, final);
                  };
                  return AsyncDecompress2;
                })();
                exports2.AsyncDecompress = AsyncDecompress;
                function decompress(data2, opts, cb) {
                  if (!cb)
                    cb = opts, opts = {};
                  if (typeof cb != "function")
                    err(7);
                  return data2[0] == 31 && data2[1] == 139 && data2[2] == 8 ? gunzip(data2, opts, cb) : (data2[0] & 15) != 8 || data2[0] >> 4 > 7 || (data2[0] << 8 | data2[1]) % 31 ? inflate(data2, opts, cb) : unzlib(data2, opts, cb);
                }
                exports2.decompress = decompress;
                function decompressSync(data2, out) {
                  return data2[0] == 31 && data2[1] == 139 && data2[2] == 8 ? gunzipSync(data2, out) : (data2[0] & 15) != 8 || data2[0] >> 4 > 7 || (data2[0] << 8 | data2[1]) % 31 ? inflateSync(data2, out) : unzlibSync(data2, out);
                }
                exports2.decompressSync = decompressSync;
                var fltn = function(d, p, t, o) {
                  for (var k in d) {
                    var val = d[k], n = p + k;
                    if (val instanceof u8)
                      t[n] = [val, o];
                    else if (Array.isArray(val))
                      t[n] = [val[0], mrg(o, val[1])];
                    else
                      fltn(val, n + "/", t, o);
                  }
                };
                var te = typeof TextEncoder != "undefined" && /* @__PURE__ */ new TextEncoder();
                var td = typeof TextDecoder != "undefined" && /* @__PURE__ */ new TextDecoder();
                var tds = 0;
                try {
                  td.decode(et, { stream: true });
                  tds = 1;
                } catch (e) {
                }
                var dutf8 = function(d) {
                  for (var r = "", i2 = 0; ; ) {
                    var c = d[i2++];
                    var eb = (c > 127) + (c > 223) + (c > 239);
                    if (i2 + eb > d.length)
                      return [r, slc(d, i2 - 1)];
                    if (!eb)
                      r += String.fromCharCode(c);
                    else if (eb == 3) {
                      c = ((c & 15) << 18 | (d[i2++] & 63) << 12 | (d[i2++] & 63) << 6 | d[i2++] & 63) - 65536, r += String.fromCharCode(55296 | c >> 10, 56320 | c & 1023);
                    } else if (eb & 1)
                      r += String.fromCharCode((c & 31) << 6 | d[i2++] & 63);
                    else
                      r += String.fromCharCode((c & 15) << 12 | (d[i2++] & 63) << 6 | d[i2++] & 63);
                  }
                };
                var DecodeUTF8 = /* @__PURE__ */ (function() {
                  function DecodeUTF82(cb) {
                    this.ondata = cb;
                    if (tds)
                      this.t = new TextDecoder();
                    else
                      this.p = et;
                  }
                  DecodeUTF82.prototype.push = function(chunk, final) {
                    if (!this.ondata)
                      err(5);
                    final = !!final;
                    if (this.t) {
                      this.ondata(this.t.decode(chunk, { stream: true }), final);
                      if (final) {
                        if (this.t.decode().length)
                          err(8);
                        this.t = null;
                      }
                      return;
                    }
                    if (!this.p)
                      err(4);
                    var dat = new u8(this.p.length + chunk.length);
                    dat.set(this.p);
                    dat.set(chunk, this.p.length);
                    var _a3 = dutf8(dat), ch2 = _a3[0], np = _a3[1];
                    if (final) {
                      if (np.length)
                        err(8);
                      this.p = null;
                    } else
                      this.p = np;
                    this.ondata(ch2, final);
                  };
                  return DecodeUTF82;
                })();
                exports2.DecodeUTF8 = DecodeUTF8;
                var EncodeUTF8 = /* @__PURE__ */ (function() {
                  function EncodeUTF82(cb) {
                    this.ondata = cb;
                  }
                  EncodeUTF82.prototype.push = function(chunk, final) {
                    if (!this.ondata)
                      err(5);
                    if (this.d)
                      err(4);
                    this.ondata(strToU8(chunk), this.d = final || false);
                  };
                  return EncodeUTF82;
                })();
                exports2.EncodeUTF8 = EncodeUTF8;
                function strToU8(str, latin1) {
                  if (latin1) {
                    var ar_1 = new u8(str.length);
                    for (var i2 = 0; i2 < str.length; ++i2)
                      ar_1[i2] = str.charCodeAt(i2);
                    return ar_1;
                  }
                  if (te)
                    return te.encode(str);
                  var l = str.length;
                  var ar = new u8(str.length + (str.length >> 1));
                  var ai = 0;
                  var w = function(v) {
                    ar[ai++] = v;
                  };
                  for (var i2 = 0; i2 < l; ++i2) {
                    if (ai + 5 > ar.length) {
                      var n = new u8(ai + 8 + (l - i2 << 1));
                      n.set(ar);
                      ar = n;
                    }
                    var c = str.charCodeAt(i2);
                    if (c < 128 || latin1)
                      w(c);
                    else if (c < 2048)
                      w(192 | c >> 6), w(128 | c & 63);
                    else if (c > 55295 && c < 57344)
                      c = 65536 + (c & 1023 << 10) | str.charCodeAt(++i2) & 1023, w(240 | c >> 18), w(128 | c >> 12 & 63), w(128 | c >> 6 & 63), w(128 | c & 63);
                    else
                      w(224 | c >> 12), w(128 | c >> 6 & 63), w(128 | c & 63);
                  }
                  return slc(ar, 0, ai);
                }
                exports2.strToU8 = strToU8;
                function strFromU8(dat, latin1) {
                  if (latin1) {
                    var r = "";
                    for (var i2 = 0; i2 < dat.length; i2 += 16384)
                      r += String.fromCharCode.apply(null, dat.subarray(i2, i2 + 16384));
                    return r;
                  } else if (td)
                    return td.decode(dat);
                  else {
                    var _a3 = dutf8(dat), out = _a3[0], ext = _a3[1];
                    if (ext.length)
                      err(8);
                    return out;
                  }
                }
                exports2.strFromU8 = strFromU8;
                ;
                var dbf = function(l) {
                  return l == 1 ? 3 : l < 6 ? 2 : l == 9 ? 1 : 0;
                };
                var slzh = function(d, b) {
                  return b + 30 + b2(d, b + 26) + b2(d, b + 28);
                };
                var zh = function(d, b, z) {
                  var fnl = b2(d, b + 28), fn = strFromU8(d.subarray(b + 46, b + 46 + fnl), !(b2(d, b + 8) & 2048)), es = b + 46 + fnl, bs = b4(d, b + 20);
                  var _a3 = z && bs == 4294967295 ? z64e(d, es) : [bs, b4(d, b + 24), b4(d, b + 42)], sc = _a3[0], su = _a3[1], off = _a3[2];
                  return [b2(d, b + 10), sc, su, fn, es + b2(d, b + 30) + b2(d, b + 32), off];
                };
                var z64e = function(d, b) {
                  for (; b2(d, b) != 1; b += 4 + b2(d, b + 2))
                    ;
                  return [b8(d, b + 12), b8(d, b + 4), b8(d, b + 20)];
                };
                var exfl = function(ex) {
                  var le = 0;
                  if (ex) {
                    for (var k in ex) {
                      var l = ex[k].length;
                      if (l > 65535)
                        err(9);
                      le += l + 4;
                    }
                  }
                  return le;
                };
                var wzh = function(d, b, f, fn, u, c, ce, co) {
                  var fl2 = fn.length, ex = f.extra, col = co && co.length;
                  var exl = exfl(ex);
                  wbytes(d, b, ce != null ? 33639248 : 67324752), b += 4;
                  if (ce != null)
                    d[b++] = 20, d[b++] = f.os;
                  d[b] = 20, b += 2;
                  d[b++] = f.flag << 1 | (c == null && 8), d[b++] = u && 8;
                  d[b++] = f.compression & 255, d[b++] = f.compression >> 8;
                  var dt = new Date(f.mtime == null ? Date.now() : f.mtime), y = dt.getFullYear() - 1980;
                  if (y < 0 || y > 119)
                    err(10);
                  wbytes(d, b, y << 25 | dt.getMonth() + 1 << 21 | dt.getDate() << 16 | dt.getHours() << 11 | dt.getMinutes() << 5 | dt.getSeconds() >>> 1), b += 4;
                  if (c != null) {
                    wbytes(d, b, f.crc);
                    wbytes(d, b + 4, c);
                    wbytes(d, b + 8, f.size);
                  }
                  wbytes(d, b + 12, fl2);
                  wbytes(d, b + 14, exl), b += 16;
                  if (ce != null) {
                    wbytes(d, b, col);
                    wbytes(d, b + 6, f.attrs);
                    wbytes(d, b + 10, ce), b += 14;
                  }
                  d.set(fn, b);
                  b += fl2;
                  if (exl) {
                    for (var k in ex) {
                      var exf = ex[k], l = exf.length;
                      wbytes(d, b, +k);
                      wbytes(d, b + 2, l);
                      d.set(exf, b + 4), b += 4 + l;
                    }
                  }
                  if (col)
                    d.set(co, b), b += col;
                  return b;
                };
                var wzf = function(o, b, c, d, e) {
                  wbytes(o, b, 101010256);
                  wbytes(o, b + 8, c);
                  wbytes(o, b + 10, c);
                  wbytes(o, b + 12, d);
                  wbytes(o, b + 16, e);
                };
                var ZipPassThrough = /* @__PURE__ */ (function() {
                  function ZipPassThrough2(filename) {
                    this.filename = filename;
                    this.c = crc();
                    this.size = 0;
                    this.compression = 0;
                  }
                  ZipPassThrough2.prototype.process = function(chunk, final) {
                    this.ondata(null, chunk, final);
                  };
                  ZipPassThrough2.prototype.push = function(chunk, final) {
                    if (!this.ondata)
                      err(5);
                    this.c.p(chunk);
                    this.size += chunk.length;
                    if (final)
                      this.crc = this.c.d();
                    this.process(chunk, final || false);
                  };
                  return ZipPassThrough2;
                })();
                exports2.ZipPassThrough = ZipPassThrough;
                var ZipDeflate = /* @__PURE__ */ (function() {
                  function ZipDeflate2(filename, opts) {
                    var _this_1 = this;
                    if (!opts)
                      opts = {};
                    ZipPassThrough.call(this, filename);
                    this.d = new Deflate(opts, function(dat, final) {
                      _this_1.ondata(null, dat, final);
                    });
                    this.compression = 8;
                    this.flag = dbf(opts.level);
                  }
                  ZipDeflate2.prototype.process = function(chunk, final) {
                    try {
                      this.d.push(chunk, final);
                    } catch (e) {
                      this.ondata(e, null, final);
                    }
                  };
                  ZipDeflate2.prototype.push = function(chunk, final) {
                    ZipPassThrough.prototype.push.call(this, chunk, final);
                  };
                  return ZipDeflate2;
                })();
                exports2.ZipDeflate = ZipDeflate;
                var AsyncZipDeflate = /* @__PURE__ */ (function() {
                  function AsyncZipDeflate2(filename, opts) {
                    var _this_1 = this;
                    if (!opts)
                      opts = {};
                    ZipPassThrough.call(this, filename);
                    this.d = new AsyncDeflate(opts, function(err2, dat, final) {
                      _this_1.ondata(err2, dat, final);
                    });
                    this.compression = 8;
                    this.flag = dbf(opts.level);
                    this.terminate = this.d.terminate;
                  }
                  AsyncZipDeflate2.prototype.process = function(chunk, final) {
                    this.d.push(chunk, final);
                  };
                  AsyncZipDeflate2.prototype.push = function(chunk, final) {
                    ZipPassThrough.prototype.push.call(this, chunk, final);
                  };
                  return AsyncZipDeflate2;
                })();
                exports2.AsyncZipDeflate = AsyncZipDeflate;
                var Zip = /* @__PURE__ */ (function() {
                  function Zip2(cb) {
                    this.ondata = cb;
                    this.u = [];
                    this.d = 1;
                  }
                  Zip2.prototype.add = function(file) {
                    var _this_1 = this;
                    if (!this.ondata)
                      err(5);
                    if (this.d & 2)
                      this.ondata(err(4 + (this.d & 1) * 8, 0, 1), null, false);
                    else {
                      var f = strToU8(file.filename), fl_1 = f.length;
                      var com = file.comment, o = com && strToU8(com);
                      var u = fl_1 != file.filename.length || o && com.length != o.length;
                      var hl_1 = fl_1 + exfl(file.extra) + 30;
                      if (fl_1 > 65535)
                        this.ondata(err(11, 0, 1), null, false);
                      var header = new u8(hl_1);
                      wzh(header, 0, file, f, u);
                      var chks_1 = [header];
                      var pAll_1 = function() {
                        for (var _i = 0, chks_2 = chks_1; _i < chks_2.length; _i++) {
                          var chk = chks_2[_i];
                          _this_1.ondata(null, chk, false);
                        }
                        chks_1 = [];
                      };
                      var tr_1 = this.d;
                      this.d = 0;
                      var ind_1 = this.u.length;
                      var uf_1 = mrg(file, {
                        f,
                        u,
                        o,
                        t: function() {
                          if (file.terminate)
                            file.terminate();
                        },
                        r: function() {
                          pAll_1();
                          if (tr_1) {
                            var nxt = _this_1.u[ind_1 + 1];
                            if (nxt)
                              nxt.r();
                            else
                              _this_1.d = 1;
                          }
                          tr_1 = 1;
                        }
                      });
                      var cl_1 = 0;
                      file.ondata = function(err2, dat, final) {
                        if (err2) {
                          _this_1.ondata(err2, dat, final);
                          _this_1.terminate();
                        } else {
                          cl_1 += dat.length;
                          chks_1.push(dat);
                          if (final) {
                            var dd = new u8(16);
                            wbytes(dd, 0, 134695760);
                            wbytes(dd, 4, file.crc);
                            wbytes(dd, 8, cl_1);
                            wbytes(dd, 12, file.size);
                            chks_1.push(dd);
                            uf_1.c = cl_1, uf_1.b = hl_1 + cl_1 + 16, uf_1.crc = file.crc, uf_1.size = file.size;
                            if (tr_1)
                              uf_1.r();
                            tr_1 = 1;
                          } else if (tr_1)
                            pAll_1();
                        }
                      };
                      this.u.push(uf_1);
                    }
                  };
                  Zip2.prototype.end = function() {
                    var _this_1 = this;
                    if (this.d & 2) {
                      this.ondata(err(4 + (this.d & 1) * 8, 0, 1), null, true);
                      return;
                    }
                    if (this.d)
                      this.e();
                    else
                      this.u.push({
                        r: function() {
                          if (!(_this_1.d & 1))
                            return;
                          _this_1.u.splice(-1, 1);
                          _this_1.e();
                        },
                        t: function() {
                        }
                      });
                    this.d = 3;
                  };
                  Zip2.prototype.e = function() {
                    var bt = 0, l = 0, tl = 0;
                    for (var _i = 0, _a3 = this.u; _i < _a3.length; _i++) {
                      var f = _a3[_i];
                      tl += 46 + f.f.length + exfl(f.extra) + (f.o ? f.o.length : 0);
                    }
                    var out = new u8(tl + 22);
                    for (var _b2 = 0, _c = this.u; _b2 < _c.length; _b2++) {
                      var f = _c[_b2];
                      wzh(out, bt, f, f.f, f.u, f.c, l, f.o);
                      bt += 46 + f.f.length + exfl(f.extra) + (f.o ? f.o.length : 0), l += f.b;
                    }
                    wzf(out, bt, this.u.length, tl, l);
                    this.ondata(null, out, true);
                    this.d = 2;
                  };
                  Zip2.prototype.terminate = function() {
                    for (var _i = 0, _a3 = this.u; _i < _a3.length; _i++) {
                      var f = _a3[_i];
                      f.t();
                    }
                    this.d = 2;
                  };
                  return Zip2;
                })();
                exports2.Zip = Zip;
                function zip(data2, opts, cb) {
                  if (!cb)
                    cb = opts, opts = {};
                  if (typeof cb != "function")
                    err(7);
                  var r = {};
                  fltn(data2, "", r, opts);
                  var k = Object.keys(r);
                  var lft = k.length, o = 0, tot = 0;
                  var slft = lft, files = new Array(lft);
                  var term = [];
                  var tAll = function() {
                    for (var i3 = 0; i3 < term.length; ++i3)
                      term[i3]();
                  };
                  var cbd = function(a, b) {
                    mt(function() {
                      cb(a, b);
                    });
                  };
                  mt(function() {
                    cbd = cb;
                  });
                  var cbf = function() {
                    var out = new u8(tot + 22), oe = o, cdl = tot - o;
                    tot = 0;
                    for (var i3 = 0; i3 < slft; ++i3) {
                      var f = files[i3];
                      try {
                        var l = f.c.length;
                        wzh(out, tot, f, f.f, f.u, l);
                        var badd = 30 + f.f.length + exfl(f.extra);
                        var loc = tot + badd;
                        out.set(f.c, loc);
                        wzh(out, o, f, f.f, f.u, l, tot, f.m), o += 16 + badd + (f.m ? f.m.length : 0), tot = loc + l;
                      } catch (e) {
                        return cbd(e, null);
                      }
                    }
                    wzf(out, o, files.length, cdl, oe);
                    cbd(null, out);
                  };
                  if (!lft)
                    cbf();
                  var _loop_1 = function(i3) {
                    var fn = k[i3];
                    var _a3 = r[fn], file = _a3[0], p = _a3[1];
                    var c = crc(), size = file.length;
                    c.p(file);
                    var f = strToU8(fn), s = f.length;
                    var com = p.comment, m = com && strToU8(com), ms = m && m.length;
                    var exl = exfl(p.extra);
                    var compression = p.level == 0 ? 0 : 8;
                    var cbl = function(e, d) {
                      if (e) {
                        tAll();
                        cbd(e, null);
                      } else {
                        var l = d.length;
                        files[i3] = mrg(p, {
                          size,
                          crc: c.d(),
                          c: d,
                          f,
                          m,
                          u: s != fn.length || m && com.length != ms,
                          compression
                        });
                        o += 30 + s + exl + l;
                        tot += 76 + 2 * (s + exl) + (ms || 0) + l;
                        if (!--lft)
                          cbf();
                      }
                    };
                    if (s > 65535)
                      cbl(err(11, 0, 1), null);
                    if (!compression)
                      cbl(null, file);
                    else if (size < 16e4) {
                      try {
                        cbl(null, deflateSync(file, p));
                      } catch (e) {
                        cbl(e, null);
                      }
                    } else
                      term.push(deflate(file, p, cbl));
                  };
                  for (var i2 = 0; i2 < slft; ++i2) {
                    _loop_1(i2);
                  }
                  return tAll;
                }
                exports2.zip = zip;
                function zipSync(data2, opts) {
                  if (!opts)
                    opts = {};
                  var r = {};
                  var files = [];
                  fltn(data2, "", r, opts);
                  var o = 0;
                  var tot = 0;
                  for (var fn in r) {
                    var _a3 = r[fn], file = _a3[0], p = _a3[1];
                    var compression = p.level == 0 ? 0 : 8;
                    var f = strToU8(fn), s = f.length;
                    var com = p.comment, m = com && strToU8(com), ms = m && m.length;
                    var exl = exfl(p.extra);
                    if (s > 65535)
                      err(11);
                    var d = compression ? deflateSync(file, p) : file, l = d.length;
                    var c = crc();
                    c.p(file);
                    files.push(mrg(p, {
                      size: file.length,
                      crc: c.d(),
                      c: d,
                      f,
                      m,
                      u: s != fn.length || m && com.length != ms,
                      o,
                      compression
                    }));
                    o += 30 + s + exl + l;
                    tot += 76 + 2 * (s + exl) + (ms || 0) + l;
                  }
                  var out = new u8(tot + 22), oe = o, cdl = tot - o;
                  for (var i2 = 0; i2 < files.length; ++i2) {
                    var f = files[i2];
                    wzh(out, f.o, f, f.f, f.u, f.c.length);
                    var badd = 30 + f.f.length + exfl(f.extra);
                    out.set(f.c, f.o + badd);
                    wzh(out, o, f, f.f, f.u, f.c.length, f.o, f.m), o += 16 + badd + (f.m ? f.m.length : 0);
                  }
                  wzf(out, o, files.length, cdl, oe);
                  return out;
                }
                exports2.zipSync = zipSync;
                var UnzipPassThrough = /* @__PURE__ */ (function() {
                  function UnzipPassThrough2() {
                  }
                  UnzipPassThrough2.prototype.push = function(data2, final) {
                    this.ondata(null, data2, final);
                  };
                  UnzipPassThrough2.compression = 0;
                  return UnzipPassThrough2;
                })();
                exports2.UnzipPassThrough = UnzipPassThrough;
                var UnzipInflate = /* @__PURE__ */ (function() {
                  function UnzipInflate2() {
                    var _this_1 = this;
                    this.i = new Inflate(function(dat, final) {
                      _this_1.ondata(null, dat, final);
                    });
                  }
                  UnzipInflate2.prototype.push = function(data2, final) {
                    try {
                      this.i.push(data2, final);
                    } catch (e) {
                      this.ondata(e, null, final);
                    }
                  };
                  UnzipInflate2.compression = 8;
                  return UnzipInflate2;
                })();
                exports2.UnzipInflate = UnzipInflate;
                var AsyncUnzipInflate = /* @__PURE__ */ (function() {
                  function AsyncUnzipInflate2(_, sz) {
                    var _this_1 = this;
                    if (sz < 32e4) {
                      this.i = new Inflate(function(dat, final) {
                        _this_1.ondata(null, dat, final);
                      });
                    } else {
                      this.i = new AsyncInflate(function(err2, dat, final) {
                        _this_1.ondata(err2, dat, final);
                      });
                      this.terminate = this.i.terminate;
                    }
                  }
                  AsyncUnzipInflate2.prototype.push = function(data2, final) {
                    if (this.i.terminate)
                      data2 = slc(data2, 0);
                    this.i.push(data2, final);
                  };
                  AsyncUnzipInflate2.compression = 8;
                  return AsyncUnzipInflate2;
                })();
                exports2.AsyncUnzipInflate = AsyncUnzipInflate;
                var Unzip = /* @__PURE__ */ (function() {
                  function Unzip2(cb) {
                    this.onfile = cb;
                    this.k = [];
                    this.o = {
                      0: UnzipPassThrough
                    };
                    this.p = et;
                  }
                  Unzip2.prototype.push = function(chunk, final) {
                    var _this_1 = this;
                    if (!this.onfile)
                      err(5);
                    if (!this.p)
                      err(4);
                    if (this.c > 0) {
                      var len = Math.min(this.c, chunk.length);
                      var toAdd = chunk.subarray(0, len);
                      this.c -= len;
                      if (this.d)
                        this.d.push(toAdd, !this.c);
                      else
                        this.k[0].push(toAdd);
                      chunk = chunk.subarray(len);
                      if (chunk.length)
                        return this.push(chunk, final);
                    } else {
                      var f = 0, i2 = 0, is = void 0, buf = void 0;
                      if (!this.p.length)
                        buf = chunk;
                      else if (!chunk.length)
                        buf = this.p;
                      else {
                        buf = new u8(this.p.length + chunk.length);
                        buf.set(this.p), buf.set(chunk, this.p.length);
                      }
                      var l = buf.length, oc = this.c, add2 = oc && this.d;
                      var _loop_2 = function() {
                        var _a3;
                        var sig = b4(buf, i2);
                        if (sig == 67324752) {
                          f = 1, is = i2;
                          this_1.d = null;
                          this_1.c = 0;
                          var bf = b2(buf, i2 + 6), cmp_1 = b2(buf, i2 + 8), u = bf & 2048, dd = bf & 8, fnl = b2(buf, i2 + 26), es = b2(buf, i2 + 28);
                          if (l > i2 + 30 + fnl + es) {
                            var chks_3 = [];
                            this_1.k.unshift(chks_3);
                            f = 2;
                            var sc_1 = b4(buf, i2 + 18), su_1 = b4(buf, i2 + 22);
                            var fn_1 = strFromU8(buf.subarray(i2 + 30, i2 += 30 + fnl), !u);
                            if (sc_1 == 4294967295) {
                              _a3 = dd ? [-2] : z64e(buf, i2), sc_1 = _a3[0], su_1 = _a3[1];
                            } else if (dd)
                              sc_1 = -1;
                            i2 += es;
                            this_1.c = sc_1;
                            var d_1;
                            var file_1 = {
                              name: fn_1,
                              compression: cmp_1,
                              start: function() {
                                if (!file_1.ondata)
                                  err(5);
                                if (!sc_1)
                                  file_1.ondata(null, et, true);
                                else {
                                  var ctr = _this_1.o[cmp_1];
                                  if (!ctr)
                                    file_1.ondata(err(14, "unknown compression type " + cmp_1, 1), null, false);
                                  d_1 = sc_1 < 0 ? new ctr(fn_1) : new ctr(fn_1, sc_1, su_1);
                                  d_1.ondata = function(err2, dat3, final2) {
                                    file_1.ondata(err2, dat3, final2);
                                  };
                                  for (var _i = 0, chks_4 = chks_3; _i < chks_4.length; _i++) {
                                    var dat2 = chks_4[_i];
                                    d_1.push(dat2, false);
                                  }
                                  if (_this_1.k[0] == chks_3 && _this_1.c)
                                    _this_1.d = d_1;
                                  else
                                    d_1.push(et, true);
                                }
                              },
                              terminate: function() {
                                if (d_1 && d_1.terminate)
                                  d_1.terminate();
                              }
                            };
                            if (sc_1 >= 0)
                              file_1.size = sc_1, file_1.originalSize = su_1;
                            this_1.onfile(file_1);
                          }
                          return "break";
                        } else if (oc) {
                          if (sig == 134695760) {
                            is = i2 += 12 + (oc == -2 && 8), f = 3, this_1.c = 0;
                            return "break";
                          } else if (sig == 33639248) {
                            is = i2 -= 4, f = 3, this_1.c = 0;
                            return "break";
                          }
                        }
                      };
                      var this_1 = this;
                      for (; i2 < l - 4; ++i2) {
                        var state_1 = _loop_2();
                        if (state_1 === "break")
                          break;
                      }
                      this.p = et;
                      if (oc < 0) {
                        var dat = f ? buf.subarray(0, is - 12 - (oc == -2 && 8) - (b4(buf, is - 16) == 134695760 && 4)) : buf.subarray(0, i2);
                        if (add2)
                          add2.push(dat, !!f);
                        else
                          this.k[+(f == 2)].push(dat);
                      }
                      if (f & 2)
                        return this.push(buf.subarray(i2), final);
                      this.p = buf.subarray(i2);
                    }
                    if (final) {
                      if (this.c)
                        err(13);
                      this.p = null;
                    }
                  };
                  Unzip2.prototype.register = function(decoder2) {
                    this.o[decoder2.compression] = decoder2;
                  };
                  return Unzip2;
                })();
                exports2.Unzip = Unzip;
                var mt = typeof queueMicrotask == "function" ? queueMicrotask : typeof setTimeout == "function" ? setTimeout : function(fn) {
                  fn();
                };
                function unzip(data2, opts, cb) {
                  if (!cb)
                    cb = opts, opts = {};
                  if (typeof cb != "function")
                    err(7);
                  var term = [];
                  var tAll = function() {
                    for (var i3 = 0; i3 < term.length; ++i3)
                      term[i3]();
                  };
                  var files = {};
                  var cbd = function(a, b) {
                    mt(function() {
                      cb(a, b);
                    });
                  };
                  mt(function() {
                    cbd = cb;
                  });
                  var e = data2.length - 22;
                  for (; b4(data2, e) != 101010256; --e) {
                    if (!e || data2.length - e > 65558) {
                      cbd(err(13, 0, 1), null);
                      return tAll;
                    }
                  }
                  ;
                  var lft = b2(data2, e + 8);
                  if (lft) {
                    var c = lft;
                    var o = b4(data2, e + 16);
                    var z = o == 4294967295;
                    if (z) {
                      e = b4(data2, e - 12);
                      if (b4(data2, e) != 101075792) {
                        cbd(err(13, 0, 1), null);
                        return tAll;
                      }
                      c = lft = b4(data2, e + 32);
                      o = b4(data2, e + 48);
                    }
                    var fltr = opts && opts.filter;
                    var _loop_3 = function(i3) {
                      var _a3 = zh(data2, o, z), c_1 = _a3[0], sc = _a3[1], su = _a3[2], fn = _a3[3], no = _a3[4], off = _a3[5], b = slzh(data2, off);
                      o = no;
                      var cbl = function(e2, d) {
                        if (e2) {
                          tAll();
                          cbd(e2, null);
                        } else {
                          if (d)
                            files[fn] = d;
                          if (!--lft)
                            cbd(null, files);
                        }
                      };
                      if (!fltr || fltr({
                        name: fn,
                        size: sc,
                        originalSize: su,
                        compression: c_1
                      })) {
                        if (!c_1)
                          cbl(null, slc(data2, b, b + sc));
                        else if (c_1 == 8) {
                          var infl = data2.subarray(b, b + sc);
                          if (sc < 32e4) {
                            try {
                              cbl(null, inflateSync(infl, new u8(su)));
                            } catch (e2) {
                              cbl(e2, null);
                            }
                          } else
                            term.push(inflate(infl, { size: su }, cbl));
                        } else
                          cbl(err(14, "unknown compression type " + c_1, 1), null);
                      } else
                        cbl(null, null);
                    };
                    for (var i2 = 0; i2 < c; ++i2) {
                      _loop_3(i2);
                    }
                  } else
                    cbd(null, {});
                  return tAll;
                }
                exports2.unzip = unzip;
                function unzipSync(data2, opts) {
                  var files = {};
                  var e = data2.length - 22;
                  for (; b4(data2, e) != 101010256; --e) {
                    if (!e || data2.length - e > 65558)
                      err(13);
                  }
                  ;
                  var c = b2(data2, e + 8);
                  if (!c)
                    return {};
                  var o = b4(data2, e + 16);
                  var z = o == 4294967295;
                  if (z) {
                    e = b4(data2, e - 12);
                    if (b4(data2, e) != 101075792)
                      err(13);
                    c = b4(data2, e + 32);
                    o = b4(data2, e + 48);
                  }
                  var fltr = opts && opts.filter;
                  for (var i2 = 0; i2 < c; ++i2) {
                    var _a3 = zh(data2, o, z), c_2 = _a3[0], sc = _a3[1], su = _a3[2], fn = _a3[3], no = _a3[4], off = _a3[5], b = slzh(data2, off);
                    o = no;
                    if (!fltr || fltr({
                      name: fn,
                      size: sc,
                      originalSize: su,
                      compression: c_2
                    })) {
                      if (!c_2)
                        files[fn] = slc(data2, b, b + sc);
                      else if (c_2 == 8)
                        files[fn] = inflateSync(data2.subarray(b, b + sc), new u8(su));
                      else
                        err(14, "unknown compression type " + c_2);
                    }
                  }
                  return files;
                }
                exports2.unzipSync = unzipSync;
              })
            ),
            /***/
            "../node_modules/fflate/lib/worker.cjs": (
              /*!*********************************************!*\
                !*** ../node_modules/fflate/lib/worker.cjs ***!
                \*********************************************/
              /***/
              ((__unused_webpack_module, exports2) => {
                var ch2 = {};
                exports2["default"] = (function(c, id, msg, transfer, cb) {
                  var w = new Worker(ch2[id] || (ch2[id] = URL.createObjectURL(new Blob([
                    c + ';addEventListener("error",function(e){e=e.error;postMessage({$e$:[e.message,e.code,e.stack]})})'
                  ], { type: "text/javascript" }))));
                  w.onmessage = function(e) {
                    var d = e.data, ed2 = d.$e$;
                    if (ed2) {
                      var err = new Error(ed2[0]);
                      err["code"] = ed2[1];
                      err.stack = ed2[2];
                      cb(err, null);
                    } else
                      cb(null, d);
                  };
                  w.postMessage(msg, transfer);
                  return w;
                });
              })
            )
            /******/
          };
          var __webpack_module_cache__ = {};
          function __webpack_require__(moduleId) {
            var cachedModule = __webpack_module_cache__[moduleId];
            if (cachedModule !== void 0) {
              return cachedModule.exports;
            }
            var module2 = __webpack_module_cache__[moduleId] = {
              /******/
              // no module.id needed
              /******/
              // no module.loaded needed
              /******/
              exports: {}
              /******/
            };
            __webpack_modules__[moduleId](module2, module2.exports, __webpack_require__);
            return module2.exports;
          }
          (() => {
            __webpack_require__.g = (function() {
              if (typeof globalThis === "object") return globalThis;
              try {
                return this || new Function("return this")();
              } catch (e) {
                if (typeof window === "object") return window;
              }
            })();
          })();
          var __webpack_exports__ = {};
          (() => {
            var exports2 = __webpack_exports__;
            Object.defineProperty(exports2, "__esModule", { value: true });
            exports2.XmlUtils = exports2.VarDictionary = exports2.Int64 = exports2.ByteUtils = exports2.BinaryStream = exports2.KdbxUuid = exports2.KdbxTimes = exports2.KdbxMeta = exports2.KdbxHeader = exports2.KdbxGroup = exports2.KdbxFormat = exports2.KdbxEntry = exports2.KdbxDeletedObject = exports2.KdbxCustomData = exports2.Credentials = exports2.KdbxCredentials = exports2.KdbxContext = exports2.KdbxBinaries = exports2.Kdbx = exports2.KdbxError = exports2.XmlNames = exports2.Consts = exports2.Salsa20 = exports2.ProtectedValue = exports2.ProtectSaltGenerator = exports2.KeyEncryptorKdf = exports2.KeyEncryptorAes = exports2.HmacBlockTransform = exports2.HashedBlockTransform = exports2.CryptoEngine = exports2.ChaCha20 = void 0;
            const chacha20_1 = __webpack_require__(
              /*! ./crypto/chacha20 */
              "./crypto/chacha20.ts"
            );
            Object.defineProperty(exports2, "ChaCha20", { enumerable: true, get: function() {
              return chacha20_1.ChaCha20;
            } });
            const CryptoEngine2 = __webpack_require__(
              /*! ./crypto/crypto-engine */
              "./crypto/crypto-engine.ts"
            );
            exports2.CryptoEngine = CryptoEngine2;
            const HashedBlockTransform = __webpack_require__(
              /*! ./crypto/hashed-block-transform */
              "./crypto/hashed-block-transform.ts"
            );
            exports2.HashedBlockTransform = HashedBlockTransform;
            const HmacBlockTransform = __webpack_require__(
              /*! ./crypto/hmac-block-transform */
              "./crypto/hmac-block-transform.ts"
            );
            exports2.HmacBlockTransform = HmacBlockTransform;
            const KeyEncryptorAes = __webpack_require__(
              /*! ./crypto/key-encryptor-aes */
              "./crypto/key-encryptor-aes.ts"
            );
            exports2.KeyEncryptorAes = KeyEncryptorAes;
            const KeyEncryptorKdf = __webpack_require__(
              /*! ./crypto/key-encryptor-kdf */
              "./crypto/key-encryptor-kdf.ts"
            );
            exports2.KeyEncryptorKdf = KeyEncryptorKdf;
            const protect_salt_generator_1 = __webpack_require__(
              /*! ./crypto/protect-salt-generator */
              "./crypto/protect-salt-generator.ts"
            );
            Object.defineProperty(exports2, "ProtectSaltGenerator", { enumerable: true, get: function() {
              return protect_salt_generator_1.ProtectSaltGenerator;
            } });
            const protected_value_1 = __webpack_require__(
              /*! ./crypto/protected-value */
              "./crypto/protected-value.ts"
            );
            Object.defineProperty(exports2, "ProtectedValue", { enumerable: true, get: function() {
              return protected_value_1.ProtectedValue;
            } });
            const salsa20_1 = __webpack_require__(
              /*! ./crypto/salsa20 */
              "./crypto/salsa20.ts"
            );
            Object.defineProperty(exports2, "Salsa20", { enumerable: true, get: function() {
              return salsa20_1.Salsa20;
            } });
            const Consts2 = __webpack_require__(
              /*! ./defs/consts */
              "./defs/consts.ts"
            );
            exports2.Consts = Consts2;
            const XmlNames = __webpack_require__(
              /*! ./defs/xml-names */
              "./defs/xml-names.ts"
            );
            exports2.XmlNames = XmlNames;
            const kdbx_error_1 = __webpack_require__(
              /*! ./errors/kdbx-error */
              "./errors/kdbx-error.ts"
            );
            Object.defineProperty(exports2, "KdbxError", { enumerable: true, get: function() {
              return kdbx_error_1.KdbxError;
            } });
            const kdbx_1 = __webpack_require__(
              /*! ./format/kdbx */
              "./format/kdbx.ts"
            );
            Object.defineProperty(exports2, "Kdbx", { enumerable: true, get: function() {
              return kdbx_1.Kdbx;
            } });
            const kdbx_binaries_1 = __webpack_require__(
              /*! ./format/kdbx-binaries */
              "./format/kdbx-binaries.ts"
            );
            Object.defineProperty(exports2, "KdbxBinaries", { enumerable: true, get: function() {
              return kdbx_binaries_1.KdbxBinaries;
            } });
            const kdbx_context_1 = __webpack_require__(
              /*! ./format/kdbx-context */
              "./format/kdbx-context.ts"
            );
            Object.defineProperty(exports2, "KdbxContext", { enumerable: true, get: function() {
              return kdbx_context_1.KdbxContext;
            } });
            const kdbx_credentials_1 = __webpack_require__(
              /*! ./format/kdbx-credentials */
              "./format/kdbx-credentials.ts"
            );
            Object.defineProperty(exports2, "KdbxCredentials", { enumerable: true, get: function() {
              return kdbx_credentials_1.KdbxCredentials;
            } });
            Object.defineProperty(exports2, "Credentials", { enumerable: true, get: function() {
              return kdbx_credentials_1.KdbxCredentials;
            } });
            const kdbx_custom_data_1 = __webpack_require__(
              /*! ./format/kdbx-custom-data */
              "./format/kdbx-custom-data.ts"
            );
            Object.defineProperty(exports2, "KdbxCustomData", { enumerable: true, get: function() {
              return kdbx_custom_data_1.KdbxCustomData;
            } });
            const kdbx_deleted_object_1 = __webpack_require__(
              /*! ./format/kdbx-deleted-object */
              "./format/kdbx-deleted-object.ts"
            );
            Object.defineProperty(exports2, "KdbxDeletedObject", { enumerable: true, get: function() {
              return kdbx_deleted_object_1.KdbxDeletedObject;
            } });
            const kdbx_entry_1 = __webpack_require__(
              /*! ./format/kdbx-entry */
              "./format/kdbx-entry.ts"
            );
            Object.defineProperty(exports2, "KdbxEntry", { enumerable: true, get: function() {
              return kdbx_entry_1.KdbxEntry;
            } });
            const kdbx_format_1 = __webpack_require__(
              /*! ./format/kdbx-format */
              "./format/kdbx-format.ts"
            );
            Object.defineProperty(exports2, "KdbxFormat", { enumerable: true, get: function() {
              return kdbx_format_1.KdbxFormat;
            } });
            const kdbx_group_1 = __webpack_require__(
              /*! ./format/kdbx-group */
              "./format/kdbx-group.ts"
            );
            Object.defineProperty(exports2, "KdbxGroup", { enumerable: true, get: function() {
              return kdbx_group_1.KdbxGroup;
            } });
            const kdbx_header_1 = __webpack_require__(
              /*! ./format/kdbx-header */
              "./format/kdbx-header.ts"
            );
            Object.defineProperty(exports2, "KdbxHeader", { enumerable: true, get: function() {
              return kdbx_header_1.KdbxHeader;
            } });
            const kdbx_meta_1 = __webpack_require__(
              /*! ./format/kdbx-meta */
              "./format/kdbx-meta.ts"
            );
            Object.defineProperty(exports2, "KdbxMeta", { enumerable: true, get: function() {
              return kdbx_meta_1.KdbxMeta;
            } });
            const kdbx_times_1 = __webpack_require__(
              /*! ./format/kdbx-times */
              "./format/kdbx-times.ts"
            );
            Object.defineProperty(exports2, "KdbxTimes", { enumerable: true, get: function() {
              return kdbx_times_1.KdbxTimes;
            } });
            const kdbx_uuid_1 = __webpack_require__(
              /*! ./format/kdbx-uuid */
              "./format/kdbx-uuid.ts"
            );
            Object.defineProperty(exports2, "KdbxUuid", { enumerable: true, get: function() {
              return kdbx_uuid_1.KdbxUuid;
            } });
            const binary_stream_1 = __webpack_require__(
              /*! ./utils/binary-stream */
              "./utils/binary-stream.ts"
            );
            Object.defineProperty(exports2, "BinaryStream", { enumerable: true, get: function() {
              return binary_stream_1.BinaryStream;
            } });
            const ByteUtils2 = __webpack_require__(
              /*! ./utils/byte-utils */
              "./utils/byte-utils.ts"
            );
            exports2.ByteUtils = ByteUtils2;
            const int64_1 = __webpack_require__(
              /*! ./utils/int64 */
              "./utils/int64.ts"
            );
            Object.defineProperty(exports2, "Int64", { enumerable: true, get: function() {
              return int64_1.Int64;
            } });
            const var_dictionary_1 = __webpack_require__(
              /*! ./utils/var-dictionary */
              "./utils/var-dictionary.ts"
            );
            Object.defineProperty(exports2, "VarDictionary", { enumerable: true, get: function() {
              return var_dictionary_1.VarDictionary;
            } });
            const XmlUtils = __webpack_require__(
              /*! ./utils/xml-utils */
              "./utils/xml-utils.ts"
            );
            exports2.XmlUtils = XmlUtils;
          })();
          return __webpack_exports__;
        })()
      );
    });
  }
});

// ../sdk/src/errors.ts
var OpenVireoError = class extends Error {
  constructor(code, message, status, options) {
    super(message, options);
    this.code = code;
    this.status = status;
    if (options?.details) this.details = options.details;
  }
  name = "OpenVireoError";
  /**
   * Extra data some codes carry, camelCased: `recovery_not_ready` has `notBefore` (RFC 3339, when the
   * reset link starts working); `plan_limit` has `limit`, `max`, `current`, `plan` and `upgradeUrl`
   * (where to change plan); `quota_exceeded` has `max` (the vault's size limit in bytes).
   */
  details;
};

// ../sdk/src/util/bytes.ts
var encoder = new TextEncoder();
var decoder = new TextDecoder("utf-8", { fatal: true });
var utf8 = (s) => encoder.encode(s);
var fromUtf8 = (b) => decoder.decode(b);
function concat(...parts) {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let i = 0;
  for (const p of parts) {
    out.set(p, i);
    i += p.length;
  }
  return out;
}
function toHex(b) {
  let s = "";
  for (const x of b) s += x.toString(16).padStart(2, "0");
  return s;
}
var B64U = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
var B64U_LOOKUP = (() => {
  const t = new Int16Array(128).fill(-1);
  for (let i = 0; i < 64; i++) t[B64U.charCodeAt(i)] = i;
  t["+".charCodeAt(0)] = 62;
  t["/".charCodeAt(0)] = 63;
  return t;
})();
function b64u(b) {
  let s = "";
  let i = 0;
  for (; i + 2 < b.length; i += 3) {
    const n = b[i] << 16 | b[i + 1] << 8 | b[i + 2];
    s += B64U[n >> 18 & 63] + B64U[n >> 12 & 63] + B64U[n >> 6 & 63] + B64U[n & 63];
  }
  const rest = b.length - i;
  if (rest === 1) {
    const n = b[i] << 16;
    s += B64U[n >> 18 & 63] + B64U[n >> 12 & 63];
  } else if (rest === 2) {
    const n = b[i] << 16 | b[i + 1] << 8;
    s += B64U[n >> 18 & 63] + B64U[n >> 12 & 63] + B64U[n >> 6 & 63];
  }
  return s;
}
function fromB64u(s) {
  const clean3 = s.replace(/=+$/, "");
  if (clean3.length % 4 === 1) throw new TypeError("invalid base64url length");
  const out = new Uint8Array(Math.floor(clean3.length * 3 / 4));
  let bits = 0;
  let acc = 0;
  let o = 0;
  for (let i = 0; i < clean3.length; i++) {
    const c = clean3.charCodeAt(i);
    const v = c < 128 ? B64U_LOOKUP[c] : -1;
    if (v < 0) throw new TypeError("invalid base64url character");
    acc = acc << 6 | v;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      out[o++] = acc >> bits & 255;
    }
  }
  return out;
}
function ctEqual(a, b) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a[i] ^ b[i];
  return d === 0;
}
function wipe(...bufs) {
  for (const b of bufs) b?.fill(0);
}
function exactBuffer(b) {
  const out = new Uint8Array(b.byteLength);
  out.set(b);
  return out.buffer;
}

// ../sdk/src/crypto/argon2.ts
var hashWasmArgon2 = async ({ type, password, salt, m, t, p, dkLen }) => {
  const hw = await Promise.resolve().then(() => (init_index_esm(), index_esm_exports));
  const fn = type === "argon2id" ? hw.argon2id : type === "argon2d" ? hw.argon2d : hw.argon2i;
  return fn({
    password,
    salt,
    iterations: t,
    parallelism: p,
    memorySize: m,
    hashLength: dkLen,
    outputType: "binary"
  });
};
var impl = hashWasmArgon2;
function argon2(params) {
  return impl(params);
}

// ../../node_modules/@noble/curves/ed25519.js
init_sha2();
init_utils();

// ../../node_modules/@noble/curves/utils.js
init_utils();
function aarray(item, title, inner = () => {
}) {
  if (!Array.isArray(item))
    throw new TypeError(`"${title}" expected array, got type=${typeof item}`);
  for (let i = 0; i < item.length; i++)
    inner(item[i], `${title}[${i}]`);
  return item;
}
var abytes2 = (value, length, title) => abytes(value, length, title);
var anumber2 = anumber;
function aobject2(value, title = "object") {
  if (value === null || typeof value !== "object" || Array.isArray(value))
    throw new TypeError(title === "object" ? "expected valid options object" : `"${title}" expected object, got type=${typeof value}`);
  return value;
}
function afunction(value, title) {
  if (typeof value !== "function")
    throw new TypeError(`"${title}" is invalid: expected function, got ${typeof value}`);
  return value;
}
var bytesToHex2 = bytesToHex;
var concatBytes2 = (...arrays) => concatBytes(...arrays);
var hexToBytes2 = (hex) => hexToBytes(hex);
var isBytes2 = isBytes;
var randomBytes2 = (bytesLength) => randomBytes(bytesLength);
var _0n = /* @__PURE__ */ BigInt(0);
var _1n = /* @__PURE__ */ BigInt(1);
var atitle2 = (title) => title ? `"${title}" ` : "";
function abool(value, title = "") {
  if (typeof value !== "boolean")
    throw new TypeError(atitle2(title) + "expected boolean, got type=" + typeof value);
  return value;
}
function abignumber(n) {
  if (typeof n === "bigint") {
    if (!isPosBig(n))
      throw new RangeError("positive bigint expected, got " + n);
  } else
    anumber2(n);
  return n;
}
function asafenumber(value, title = "") {
  if (typeof value !== "number") {
    const prefix = title && `"${title}" `;
    throw new TypeError(prefix + "expected number, got type=" + typeof value);
  }
  if (!Number.isSafeInteger(value)) {
    const prefix = title && `"${title}" `;
    throw new RangeError(prefix + "expected safe integer, got " + value);
  }
}
function hexToNumber(hex) {
  if (typeof hex !== "string")
    throw new TypeError("hex string expected, got " + typeof hex);
  return hex === "" ? _0n : BigInt("0x" + hex);
}
function bytesToNumberBE(bytes) {
  return hexToNumber(bytesToHex(bytes));
}
function bytesToNumberLE(bytes) {
  return hexToNumber(bytesToHex(copyBytes(abytes(bytes)).reverse()));
}
function numberToBytesBE(n, len) {
  anumber(len);
  if (len === 0)
    throw new Error("zero output length is invalid");
  n = abignumber(n);
  const expectedLen = len * 2;
  const hex = n.toString(16);
  if (hex.length > expectedLen)
    throw new RangeError("number is too large");
  return hexToBytes(hex.padStart(expectedLen, "0"));
}
function numberToBytesLE(n, len) {
  return numberToBytesBE(n, len).reverse();
}
function copyBytes(bytes) {
  return Uint8Array.from(abytes2(bytes));
}
function isPosBig(n) {
  return typeof n === "bigint" && _0n <= n;
}
function inRange(n, min, max) {
  return isPosBig(n) && isPosBig(min) && isPosBig(max) && min <= n && n < max;
}
function aInRange(title, n, min, max) {
  if (!inRange(n, min, max))
    throw new RangeError("expected valid " + title + ": " + min + " <= n < " + max + ", got " + n);
}
function bitLen(n) {
  if (n < _0n)
    throw new Error("expected non-negative bigint, got " + n);
  return n === _0n ? 0 : n.toString(2).length;
}
var bitMask = (n) => {
  asafenumber(n, "n");
  return (_1n << BigInt(n)) - _1n;
};
function validateObject(object, fields = {}, optFields = {}, title = "object") {
  aobject2(object, title);
  aobject2(fields, "fields");
  aobject2(optFields, "optFields");
  function checkField(fieldName2, expectedType, isOpt) {
    const label = title === "object" ? `param "${String(fieldName2)}"` : `"${title}.${String(fieldName2)}"`;
    const val = object[fieldName2];
    if (!Object.hasOwn(object, fieldName2) && (isOpt ? val !== void 0 : expectedType !== "function")) {
      throw new TypeError(`${label} is invalid: expected own property`);
    }
    if (isOpt && val === void 0)
      return;
    const current = typeof val;
    if (current !== expectedType || val === null)
      throw new TypeError(`${label} is invalid: expected ${expectedType}, got ${current}`);
  }
  const iter = (f, isOpt) => Object.entries(f).forEach(([k, v]) => checkField(k, v, isOpt));
  iter(fields, false);
  iter(optFields, true);
}

// ../../node_modules/@noble/curves/abstract/modular.js
var _0n2 = /* @__PURE__ */ BigInt(0);
var _1n2 = /* @__PURE__ */ BigInt(1);
var _2n = /* @__PURE__ */ BigInt(2);
var _3n = /* @__PURE__ */ BigInt(3);
var _4n = /* @__PURE__ */ BigInt(4);
var _5n = /* @__PURE__ */ BigInt(5);
var _7n = /* @__PURE__ */ BigInt(7);
var _8n = /* @__PURE__ */ BigInt(8);
var _9n = /* @__PURE__ */ BigInt(9);
var _15n = /* @__PURE__ */ BigInt(15);
var _16n = /* @__PURE__ */ BigInt(16);
var POW_WINDOWED_MIN = /* @__PURE__ */ BigInt("0x10000000000000000");
function mod(a, b) {
  if (b <= _0n2)
    throw new Error("mod: expected positive modulus, got " + b);
  const result = a % b;
  return result >= _0n2 ? result : b + result;
}
function pow(num, power, modulo) {
  if (modulo <= _1n2)
    throw new Error("pow: expected modulus > 1, got " + modulo);
  if (typeof power !== "bigint")
    throw new TypeError("invalid exponent: expected bigint, got " + typeof power);
  if (power < _0n2)
    throw new Error("invalid exponent, negatives unsupported");
  if (power === _0n2)
    return _1n2;
  if (power === _1n2)
    return num;
  let d = num % modulo;
  if (d < _0n2)
    d += modulo;
  if (power < POW_WINDOWED_MIN) {
    let p2 = _1n2;
    while (power > _0n2) {
      if (power & _1n2)
        p2 = p2 * d % modulo;
      d = d * d % modulo;
      power >>= _1n2;
    }
    return p2;
  }
  const digits = [];
  while (power > _0n2) {
    digits.push(Number(power & _15n));
    power >>= _4n;
  }
  const table = new Array(16);
  table[0] = _1n2;
  table[1] = d;
  for (let i = 2; i < 16; i++)
    table[i] = table[i - 1] * d % modulo;
  let p = table[digits[digits.length - 1]];
  for (let w = digits.length - 2; w >= 0; w--) {
    p = p * p % modulo;
    p = p * p % modulo;
    p = p * p % modulo;
    p = p * p % modulo;
    const digit2 = digits[w];
    if (digit2 !== 0)
      p = p * table[digit2] % modulo;
  }
  return p;
}
function pow2(x, power, modulo) {
  if (modulo <= _1n2)
    throw new Error("pow2: expected modulus > 1, got " + modulo);
  if (power < _0n2)
    throw new Error("pow2: expected non-negative exponent, got " + power);
  let res = x;
  while (power-- > _0n2) {
    res *= res;
    res %= modulo;
  }
  return res;
}
function invert(number, modulo) {
  if (number === _0n2)
    throw new Error("invert: expected non-zero number");
  if (modulo <= _1n2)
    throw new Error("invert: expected modulus > 1, got " + modulo);
  let a = mod(number, modulo);
  let b = modulo;
  let x = _0n2, u = _1n2;
  while (a !== _0n2) {
    const q = b / a;
    const r = b - a * q;
    const m = x - u * q;
    b = a, a = r, x = u, u = m;
  }
  const gcd = b;
  if (gcd !== _1n2)
    throw new Error("invert: does not exist");
  return mod(x, modulo);
}
function assertIsSquare(Fp2, root, n) {
  const F = Fp2;
  if (!F.eql(F.sqr(root), n))
    throw new Error("Cannot find square root");
}
function aoddModulus(order, fnName) {
  if ((order & _1n2) === _0n2)
    throw new Error(fnName + ": expected odd modulus, got " + order);
}
function sqrt3mod4(Fp2, n) {
  const F = Fp2;
  const p1div4 = (F.ORDER + _1n2) / _4n;
  const root = F.pow(n, p1div4);
  assertIsSquare(F, root, n);
  return root;
}
function sqrt5mod8(Fp2, n) {
  const F = Fp2;
  const p5div8 = (F.ORDER - _5n) / _8n;
  const n2 = F.mul(n, _2n);
  const v = F.pow(n2, p5div8);
  const nv = F.mul(n, v);
  const i = F.mul(F.mul(nv, _2n), v);
  const root = F.mul(nv, F.sub(i, F.ONE));
  assertIsSquare(F, root, n);
  return root;
}
function sqrt9mod16(P) {
  const Fp_ = Field(P);
  const tn = tonelliShanks(P);
  const c1 = tn(Fp_, Fp_.neg(Fp_.ONE));
  const c2 = tn(Fp_, c1);
  const c3 = tn(Fp_, Fp_.neg(c1));
  const c4 = (P + _7n) / _16n;
  return ((Fp2, n) => {
    const F = Fp2;
    let tv1 = F.pow(n, c4);
    let tv2 = F.mul(tv1, c1);
    const tv3 = F.mul(tv1, c2);
    const tv4 = F.mul(tv1, c3);
    const e1 = F.eql(F.sqr(tv2), n);
    const e2 = F.eql(F.sqr(tv3), n);
    tv1 = F.cmov(tv1, tv2, e1);
    tv2 = F.cmov(tv4, tv3, e2);
    const e3 = F.eql(F.sqr(tv2), n);
    const root = F.cmov(tv1, tv2, e3);
    assertIsSquare(F, root, n);
    return root;
  });
}
function tonelliShanks(P) {
  if (P < _3n)
    throw new Error("sqrt is not defined for small field");
  aoddModulus(P, "tonelliShanks");
  let Q = P - _1n2;
  let S = 0;
  while (Q % _2n === _0n2) {
    Q /= _2n;
    S++;
  }
  let Z = _2n;
  const _Fp = Field(P);
  while (FpLegendre(_Fp, Z) === 1) {
    if (Z++ > 1e3)
      throw new Error("Cannot find square root: probably non-prime P");
  }
  if (S === 1)
    return sqrt3mod4;
  let cc = _Fp.pow(Z, Q);
  const Q1div2 = (Q + _1n2) / _2n;
  return function tonelliSlow(Fp2, n) {
    const F = Fp2;
    if (F.is0(n))
      return n;
    if (FpLegendre(F, n) !== 1)
      throw new Error("Cannot find square root");
    let M = S;
    let c = F.mul(F.ONE, cc);
    let t = F.pow(n, Q);
    let R = F.pow(n, Q1div2);
    while (!F.eql(t, F.ONE)) {
      if (F.is0(t))
        throw new Error("Cannot find square root: probably non-prime P");
      let i = 1;
      let t_tmp = F.sqr(t);
      while (!F.eql(t_tmp, F.ONE)) {
        i++;
        t_tmp = F.sqr(t_tmp);
        if (i === M)
          throw new Error("Cannot find square root");
      }
      const exponent = _1n2 << BigInt(M - i - 1);
      const b = F.pow(c, exponent);
      M = i;
      c = F.sqr(b);
      t = F.mul(t, c);
      R = F.mul(R, b);
    }
    return R;
  };
}
function FpSqrt(P) {
  aoddModulus(P, "Fp.sqrt");
  if (P % _4n === _3n)
    return sqrt3mod4;
  if (P % _8n === _5n)
    return sqrt5mod8;
  if (P % _16n === _9n)
    return sqrt9mod16(P);
  return tonelliShanks(P);
}
var isNegativeLE = (num, modulo) => (mod(num, modulo) & _1n2) === _1n2;
var FIELD_FIELDS = [
  "create",
  "isValid",
  "is0",
  "neg",
  "inv",
  "sqrt",
  "sqr",
  "eql",
  "add",
  "sub",
  "mul",
  "pow",
  "div",
  "addN",
  "subN",
  "mulN",
  "sqrN"
];
function validateField(field) {
  aobject2(field, "field");
  if (typeof field.ORDER !== "bigint")
    throw new TypeError('param "ORDER" is invalid: expected bigint, got ' + typeof field.ORDER);
  asafenumber(field.BYTES, "BYTES");
  asafenumber(field.BITS, "BITS");
  for (const name2 of FIELD_FIELDS)
    afunction(field[name2], "field." + name2);
  if (field.BYTES < 1 || field.BITS < 1)
    throw new Error("invalid field: expected BYTES/BITS > 0");
  if (field.ORDER <= _1n2)
    throw new Error("invalid field: expected ORDER > 1, got " + field.ORDER);
  return field;
}
function FpInvertBatch(Fp2, nums, passZero = false) {
  validateField(Fp2);
  aarray(nums, "nums");
  abool(passZero, "passZero");
  const F = Fp2;
  const inverted = new Array(nums.length).fill(passZero ? F.ZERO : void 0);
  const multipliedAcc = nums.reduce((acc, num, i) => {
    if (F.is0(num))
      return acc;
    inverted[i] = acc;
    return F.mul(acc, num);
  }, F.ONE);
  const invertedAcc = F.inv(multipliedAcc);
  nums.reduceRight((acc, num, i) => {
    if (F.is0(num))
      return acc;
    inverted[i] = F.mul(acc, inverted[i]);
    return F.mul(acc, num);
  }, invertedAcc);
  return inverted;
}
function FpLegendre(Fp2, n) {
  validateField(Fp2);
  const F = Fp2;
  aoddModulus(F.ORDER, "FpLegendre");
  const p1mod2 = (F.ORDER - _1n2) / _2n;
  const powered = F.pow(n, p1mod2);
  const yes = F.eql(powered, F.ONE);
  const zero = F.eql(powered, F.ZERO);
  const no = F.eql(powered, F.neg(F.ONE));
  if (!yes && !zero && !no)
    throw new Error("invalid Legendre symbol result");
  return yes ? 1 : zero ? 0 : -1;
}
function nLength(n, nBitLength) {
  if (nBitLength !== void 0)
    anumber2(nBitLength);
  if (n <= _0n2)
    throw new Error("invalid n length: expected positive n, got " + n);
  if (nBitLength !== void 0 && nBitLength < 1)
    throw new Error("invalid n length: expected positive bit length, got " + nBitLength);
  const bits = bitLen(n);
  if (nBitLength !== void 0 && nBitLength < bits)
    throw new Error(`invalid n length: expected nBitLength (${nBitLength}) >= bitLen(n) (${bits})`);
  const _nBitLength = nBitLength !== void 0 ? nBitLength : bits;
  const nByteLength = Math.ceil(_nBitLength / 8);
  return { nBitLength: _nBitLength, nByteLength };
}
var FIELD_SQRT = /* @__PURE__ */ new WeakMap();
var _Field = class {
  ORDER;
  BITS;
  BYTES;
  isLE;
  ZERO = _0n2;
  ONE = _1n2;
  _lengths;
  _mod;
  constructor(ORDER, opts = {}) {
    if (ORDER <= _1n2)
      throw new Error("invalid field: expected ORDER > 1, got " + ORDER);
    let _nbitLength = void 0;
    this.isLE = false;
    if (opts != null && typeof opts === "object") {
      if (typeof opts.BITS === "number")
        _nbitLength = opts.BITS;
      if (typeof opts.sqrt === "function")
        Object.defineProperty(this, "sqrt", { value: opts.sqrt, enumerable: true });
      if (typeof opts.isLE === "boolean")
        this.isLE = opts.isLE;
      if (opts.allowedLengths)
        this._lengths = Object.freeze(opts.allowedLengths.slice());
      if (typeof opts.modFromBytes === "boolean")
        this._mod = opts.modFromBytes;
    }
    const { nBitLength, nByteLength } = nLength(ORDER, _nbitLength);
    if (nByteLength > 2048)
      throw new Error("invalid field: expected ORDER of <= 2048 bytes");
    this.ORDER = ORDER;
    this.BITS = nBitLength;
    this.BYTES = nByteLength;
    Object.freeze(this);
  }
  create(num) {
    return mod(num, this.ORDER);
  }
  isValid(num) {
    if (typeof num !== "bigint")
      throw new TypeError("invalid field element: expected bigint, got " + typeof num);
    return _0n2 <= num && num < this.ORDER;
  }
  is0(num) {
    return num === _0n2;
  }
  // is valid and invertible
  isValidNot0(num) {
    return !this.is0(num) && this.isValid(num);
  }
  isOdd(num) {
    return (num & _1n2) === _1n2;
  }
  neg(num) {
    return mod(-num, this.ORDER);
  }
  eql(lhs, rhs) {
    return lhs === rhs;
  }
  sqr(num) {
    return mod(num * num, this.ORDER);
  }
  add(lhs, rhs) {
    return mod(lhs + rhs, this.ORDER);
  }
  sub(lhs, rhs) {
    return mod(lhs - rhs, this.ORDER);
  }
  mul(lhs, rhs) {
    return mod(lhs * rhs, this.ORDER);
  }
  pow(num, power) {
    return pow(num, power, this.ORDER);
  }
  div(lhs, rhs) {
    return mod(lhs * invert(rhs, this.ORDER), this.ORDER);
  }
  // Same as above, but doesn't normalize
  sqrN(num) {
    return num * num;
  }
  addN(lhs, rhs) {
    return lhs + rhs;
  }
  subN(lhs, rhs) {
    return lhs - rhs;
  }
  mulN(lhs, rhs) {
    return lhs * rhs;
  }
  inv(num) {
    return invert(num, this.ORDER);
  }
  sqrt(num) {
    let sqrt = FIELD_SQRT.get(this);
    if (!sqrt)
      FIELD_SQRT.set(this, sqrt = FpSqrt(this.ORDER));
    return sqrt(this, num);
  }
  toBytes(num) {
    return this.isLE ? numberToBytesLE(num, this.BYTES) : numberToBytesBE(num, this.BYTES);
  }
  fromBytes(bytes, skipValidation = false) {
    abytes2(bytes);
    const { _lengths: allowedLengths, BYTES, isLE: isLE2, ORDER, _mod: modFromBytes } = this;
    if (allowedLengths) {
      if (bytes.length < 1 || !allowedLengths.includes(bytes.length) || bytes.length > BYTES) {
        throw new Error("Field.fromBytes: expected " + allowedLengths + " bytes, got " + bytes.length);
      }
      const padded = new Uint8Array(BYTES);
      padded.set(bytes, isLE2 ? 0 : padded.length - bytes.length);
      bytes = padded;
    }
    if (bytes.length !== BYTES)
      throw new Error("Field.fromBytes: expected " + BYTES + " bytes, got " + bytes.length);
    let scalar = isLE2 ? bytesToNumberLE(bytes) : bytesToNumberBE(bytes);
    if (modFromBytes)
      scalar = mod(scalar, ORDER);
    if (!skipValidation) {
      if (!this.isValid(scalar))
        throw new Error("invalid field element: outside of range 0..ORDER");
    }
    return scalar;
  }
  // TODO: we don't need it here, move out to separate fn
  invertBatch(lst) {
    return FpInvertBatch(this, lst, true);
  }
  // We can't move this out because Fp6, Fp12 implement it
  // and it's unclear what to return in there.
  cmov(a, b, condition) {
    abool(condition, "condition");
    return condition ? b : a;
  }
};
function Field(ORDER, opts = {}) {
  Object.freeze(_Field.prototype);
  return new _Field(ORDER, opts);
}

// ../../node_modules/@noble/curves/abstract/curve.js
var _0n3 = /* @__PURE__ */ BigInt(0);
var _1n3 = /* @__PURE__ */ BigInt(1);
var _4n2 = /* @__PURE__ */ BigInt(4);
var BLIND_BYTES = 16;
var BLIND_BITS = 128;
var FW_WINDOW = 5;
var TABLE_BYTES_MAX = /* @__PURE__ */ (() => 2 ** 31)();
function validatePointCons(Point) {
  const pc = Point;
  if (typeof pc !== "function")
    throw new TypeError('"Point" expected constructor, got type=' + typeof Point);
  afunction(pc.fromAffine, "Point.fromAffine");
  afunction(pc.fromBytes, "Point.fromBytes");
  afunction(pc.fromHex, "Point.fromHex");
  aobject2(pc.BASE, "Point.BASE");
  aobject2(pc.ZERO, "Point.ZERO");
  validateField(pc.Fp);
  validateField(pc.Fn);
}
function normalizeZ(c, points) {
  validatePointCons(c);
  validateMSMPoints(points, c);
  const invertedZs = FpInvertBatch(c.Fp, points.map((p) => p.Z));
  return points.map((p, i) => c.fromAffine(p.toAffine(invertedZs[i])));
}
function validateW(W, bits, min = 1) {
  if (!Number.isSafeInteger(W) || W < min || W > bits)
    throw new Error("invalid window size, expected [" + min + ".." + bits + "], got W=" + W);
}
function validateTableBytes(numPoints, fpBytes) {
  const bytes = numPoints * (4 * fpBytes + 128);
  if (bytes > TABLE_BYTES_MAX)
    throw new Error("invalid window size: table would need ~" + Math.ceil(bytes / 2 ** 20) + " MiB, max " + TABLE_BYTES_MAX / 2 ** 20 + " MiB");
}
function probeRandomBytes(randomBytes6, length) {
  if (randomBytes6 === void 0)
    return void 0;
  afunction(randomBytes6, "randomBytes");
  try {
    const probe = randomBytes6(length);
    if (!isBytes2(probe) || probe.length !== length)
      return void 0;
  } catch {
    return void 0;
  }
  return randomBytes6;
}
function validateMSMPoints(points, c) {
  aarray(points, "points");
  points.forEach((p, i) => {
    if (!(p instanceof c))
      throw new Error("invalid point at index " + i);
  });
}
function validateMSMScalars(scalars, field, maxScalar) {
  if (!Array.isArray(scalars))
    throw new Error("array of scalars expected");
  scalars.forEach((s, i) => {
    const ok = maxScalar === void 0 ? field.isValid(s) : isPosBig(s) && s < maxScalar;
    if (!ok)
      throw new Error("invalid scalar at index " + i);
  });
}
var pointWindowSizes = /* @__PURE__ */ new WeakMap();
function getWindowSize(P) {
  return pointWindowSizes.get(P) || 1;
}
function oddMultiples(p, size) {
  const dbl = p.double();
  const t = [p];
  for (let j = 1; j < size; j++)
    t.push(t[j - 1].add(dbl));
  return t;
}
function wnafDigits(n, W) {
  const size = 2 ** W;
  const half = size / 2;
  const mask = BigInt(size - 1);
  const d = [];
  while (n > _0n3) {
    let w = 0;
    if (n & _1n3) {
      w = Number(n & mask);
      if (w >= half)
        w -= size;
      n -= BigInt(w);
    }
    d.push(w);
    n >>= _1n3;
  }
  return d;
}
function signedWindowDigits(n, W, windows) {
  const size = 2 ** W;
  const half = size / 2;
  const mask = BigInt(size - 1);
  const shiftBy = BigInt(W);
  const d = [];
  for (let w = 0; w < windows; w++) {
    let v = Number(n & mask);
    n >>= shiftBy;
    if (v > half) {
      v -= size;
      n += _1n3;
    }
    d.push(v);
  }
  if (n !== _0n3)
    throw new Error("invalid wnaf");
  return d;
}
function wnafWalk(zero, tables, digits) {
  let max = 0;
  for (const d of digits)
    max = Math.max(max, d.length);
  let acc = zero;
  for (let bit = max - 1; bit >= 0; bit--) {
    if (bit !== max - 1)
      acc = acc.double();
    for (let i = 0; i < digits.length; i++) {
      const w = digits[i][bit];
      if (w) {
        const item = tables[i][Math.abs(w) - 1 >> 1];
        acc = acc.add(w < 0 ? item.negate() : item);
      }
    }
  }
  return acc;
}
var ScalarMultiplier = class {
  Point;
  BASE;
  ZERO;
  randomBytes;
  wnafPrecomputes = /* @__PURE__ */ new WeakMap();
  baseCanBeBlinded;
  bits;
  // Parametrized with a given Point class (not individual point)
  constructor(Point, randomBytes6) {
    validatePointCons(Point);
    this.randomBytes = probeRandomBytes(randomBytes6, BLIND_BYTES);
    this.Point = Point;
    this.BASE = Point.BASE;
    this.ZERO = Point.ZERO;
    this.bits = Point.Fn.BITS;
  }
  /**
   * Creates a signed fixed-window wNAF precomputation table: for every window w, the
   * multiples `[1..2^(W−1)]⋅2^(w⋅W)⋅P`, flattened. All doublings are baked into the table,
   * so cached multiplication is additions-only. `windows = ceil(bits/W) + 1`: the extra
   * window absorbs the final carry of signed-digit recoding.
   * For a 256-bit curve and W=6, the table is 44⋅32 = 1408 points.
   * @param point - Point instance
   * @param W - window size
   * @param bits - scalar bitlength the table must cover
   */
  buildWnafTable(point, W, bits) {
    const windows = Math.ceil(bits / W) + 1;
    const half = 2 ** (W - 1);
    const comp = [];
    let base = point;
    for (let w = 0; w < windows; w++) {
      let acc = base;
      for (let i = 0; i < half; i++) {
        comp.push(acc);
        acc = acc.add(base);
      }
      base = comp[comp.length - 1].double();
    }
    return { W, bits, windows, comp };
  }
  /**
   * Implements ec multiplication using precomputed signed fixed-window wNAF tables.
   * Constant-time: fixed window count with one table addition per window — zero digits feed
   * the fake accumulator — and no doublings; the lookup scans the whole window slice.
   * Scalar bounds are validated by the public entry points ({@link ScalarMultiplier.mulCT},
   * {@link ScalarMultiplier.mulCTBlinded}, {@link ScalarMultiplier.mulUnsafe});
   * signedWindowDigits throws if `n` exceeds the table.
   * @returns real and fake (for const-time) points
   */
  wnafCachedCT(precomputes, n) {
    const { W, windows, comp } = precomputes;
    const half = 2 ** (W - 1);
    const digits = signedWindowDigits(n, W, windows);
    let p = this.ZERO;
    let f = this.BASE;
    for (let w = 0; w < windows; w++) {
      const digit2 = digits[w];
      const start = w * half;
      const idx = Math.abs(digit2) - 1;
      let sel = comp[start];
      for (let i = 1; i < half; i++)
        sel = i === idx ? comp[start + i] : sel;
      const neg = sel.negate();
      if (digit2 === 0)
        f = f.add(comp[start]);
      else
        p = p.add(digit2 < 0 ? neg : sel);
    }
    return { p, f };
  }
  // Cache key is point identity plus (W, bits); at most two entries exist per point (public-width
  // `Fn.BITS` and blinded `Fn.BITS + BLIND_BITS`). Callers must not reuse the same point with
  // incompatible `transform(...)` layouts and expect a separate cache entry.
  getWnafPrecomputes(W, point, bits, transform) {
    let entries = this.wnafPrecomputes.get(point);
    let comp = entries?.find((entry) => entry.W === W && entry.bits === bits);
    if (!comp) {
      comp = this.buildWnafTable(point, W, bits);
      if (typeof transform === "function")
        comp = { ...comp, comp: transform(comp.comp) };
      if (!entries) {
        entries = [];
        this.wnafPrecomputes.set(point, entries);
      }
      entries.push(comp);
    }
    return comp;
  }
  assertPoint(point) {
    if (!(point instanceof this.Point))
      throw new TypeError('"point" expected Point instance, got type=' + typeof point);
  }
  // Shared prologue of the constant-time entry points. Rejects scalar 0: in key/signature-style
  // callers a zero scalar means broken upstream plumbing, and concrete Points already reject it.
  // Uses inRange instead of Fn.isValidNot0: validateField() only certifies the arithmetic subset.
  validateMulInput(point, scalar) {
    this.assertPoint(point);
    if (!inRange(scalar, _1n3, this.Point.Fn.ORDER))
      throw new Error("invalid scalar");
  }
  // Constant-time dispatch shared by mulCT / mulCTBlinded. Un-precomputed points (W===1, e.g.
  // ECDH peer keys) skip building a throwaway cached table in favor of a small fixed-window
  // multiply. `n` must be < 2^bits.
  runCT(point, n, bits, transform) {
    const W = getWindowSize(point);
    if (W === 1)
      return this.fixedWindowCT(point, n, bits);
    return this.wnafCachedCT(this.getWnafPrecomputes(W, point, bits, transform), n);
  }
  mulCT(point, scalar, transform) {
    this.validateMulInput(point, scalar);
    return this.runCT(point, scalar, this.bits, transform);
  }
  mulCTBlinded(point, scalar, transform) {
    this.validateMulInput(point, scalar);
    if (this.randomBytes === void 0)
      throw new Error("randomBytes is required for scalar blinding");
    const bits = this.Point.Fn.BITS + BLIND_BITS;
    const blind = this.randomBytes(BLIND_BYTES);
    if (!isBytes2(blind) || blind.length !== BLIND_BYTES)
      throw new Error("randomBytes returned invalid byte array");
    blind[0] = blind[0] & 63 | 128;
    const n = scalar + bytesToNumberBE(blind) * this.Point.Fn.ORDER;
    return this.runCT(point, n, bits, transform);
  }
  /**
   * Constant-time multiplication `n*point` for an un-precomputed point, via a small fixed window.
   * A cached wNAF table only pays off when reused; a flat 2^FW_WINDOW table (`size-1` adds) is
   * far cheaper to build for a single use. The point-operation sequence is independent of `n`:
   * build the table, then per window exactly FW_WINDOW doublings, a data-oblivious scan over
   * every table entry, and one addition (adds the identity when the window digit is 0 — never
   * skipped).
   *
   * `n` must be `< 2^bits`. Assumes complete addition (adding the identity costs the same as any
   * add), which holds for the Weierstrass/Edwards point types used here. The table is left in
   * projective form (no normalizeZ): normalizing this small a table costs more than the
   * mixed-add savings it would buy for a single multiply.
   * @returns real point `p`; `f` duplicates it only to match {@link wnafCachedCT}'s return shape
   * (this path needs no fake accumulator — its op-count is already scalar-independent).
   */
  fixedWindowCT(point, n, bits) {
    const W = FW_WINDOW;
    const size = 1 << W;
    const mask = bitMask(W);
    const table = new Array(size);
    table[0] = this.ZERO;
    for (let i = 1; i < size; i++)
      table[i] = table[i - 1].add(point);
    const windows = Math.ceil(bits / W);
    let acc = this.ZERO;
    for (let window2 = windows - 1; window2 >= 0; window2--) {
      if (window2 !== windows - 1)
        for (let d = 0; d < W; d++)
          acc = acc.double();
      const digit2 = Number(n >> BigInt(window2 * W) & mask);
      let sel = table[0];
      for (let i = 1; i < size; i++)
        sel = i === digit2 ? table[i] : sel;
      acc = acc.add(sel);
    }
    return { p: acc, f: acc };
  }
  shouldBlind(point, cofactor) {
    if (this.randomBytes === void 0)
      return false;
    if (cofactor === _1n3)
      return true;
    if (point !== this.BASE)
      return false;
    if (this.baseCanBeBlinded === void 0)
      this.baseCanBeBlinded = this.mulUnsafe(this.BASE, this.Point.Fn.ORDER).is0();
    return this.baseCanBeBlinded;
  }
  mulSecret(point, scalar, cofactor, transform) {
    return this.shouldBlind(point, cofactor) ? this.mulCTBlinded(point, scalar, transform) : this.mulCT(point, scalar, transform);
  }
  mulUnsafe(point, scalar, transform) {
    this.assertPoint(point);
    if (!isPosBig(scalar))
      throw new Error("invalid scalar");
    const W = getWindowSize(point);
    if (W === 1 || scalar >= this.Point.Fn.ORDER)
      return mulAddUnsafe(this.Point, [point], [scalar], true);
    const precomputes = this.getWnafPrecomputes(W, point, this.bits, transform);
    return this.wnafCachedCT(precomputes, scalar).p;
  }
  // Remembers the window size used for precomputed wNAF multiplication of the given point
  // and drops any previously built tables. Usually only the base point is precomputed.
  // W=1 resets the point to the un-precomputed (table-less) paths.
  // W is additionally capped so tables stay under ~2 GiB ({@link TABLE_BYTES_MAX}).
  setWindowSize(point, W) {
    this.assertPoint(point);
    validateW(W, this.bits);
    const windows = Math.ceil((this.bits + BLIND_BITS) / W) + 1;
    validateTableBytes(windows * 2 ** (W - 1), this.Point.Fp.BYTES);
    pointWindowSizes.set(point, W);
    this.wnafPrecomputes.delete(point);
  }
  // True when a window size is set: tables themselves are built lazily on first multiply.
  hasWindowSize(point) {
    return getWindowSize(point) !== 1;
  }
};
function mulAddUnsafe(c, points, scalars, allowOversized = false) {
  validatePointCons(c);
  validateMSMPoints(points, c);
  abool(allowOversized, "allowOversized");
  validateMSMScalars(scalars, c.Fn, allowOversized ? c.Fn.ORDER ** _4n2 : void 0);
  if (points.length !== scalars.length)
    throw new Error("arrays of points and scalars must have equal length");
  const tables = points.map((p) => oddMultiples(p, 4));
  const digits = scalars.map((n) => wnafDigits(n, 4));
  return wnafWalk(c.ZERO, tables, digits);
}
function createField(order, field, isLE2) {
  if (field) {
    if (field.ORDER !== order)
      throw new Error("Field.ORDER must match order: Fp == p, Fn == n");
    validateField(field);
    return field;
  } else {
    return Field(order, { isLE: isLE2 });
  }
}
function createCurveFields(type, CURVE, curveOpts = {}, FpFnLE) {
  if (type !== "weierstrass" && type !== "edwards")
    throw new Error('expected curve type "weierstrass" or "edwards"');
  if (FpFnLE === void 0)
    FpFnLE = type === "edwards";
  if (!CURVE || typeof CURVE !== "object")
    throw new Error(`expected valid ${type} CURVE object`);
  validateObject(curveOpts);
  for (const p of ["p", "n", "h"]) {
    const val = CURVE[p];
    if (!(isPosBig(val) && val !== _0n3))
      throw new Error(`CURVE.${p} must be positive bigint`);
  }
  const Fp2 = createField(CURVE.p, curveOpts.Fp, FpFnLE);
  const Fn = createField(CURVE.n, curveOpts.Fn, FpFnLE);
  const _b = type === "weierstrass" ? "b" : "d";
  const params = ["Gx", "Gy", "a", _b];
  for (const p of params) {
    if (!Fp2.isValid(CURVE[p]))
      throw new Error(`CURVE.${p} must be valid field element of CURVE.Fp`);
  }
  CURVE = Object.freeze(Object.assign({}, CURVE));
  return { CURVE, Fp: Fp2, Fn };
}
function createKeygen(randomSecretKey, getPublicKey) {
  return function keygen(seed) {
    const secretKey = randomSecretKey(seed);
    return { secretKey, publicKey: getPublicKey(secretKey) };
  };
}

// ../../node_modules/@noble/curves/abstract/edwards.js
var _0n4 = /* @__PURE__ */ BigInt(0);
var _1n4 = /* @__PURE__ */ BigInt(1);
var _2n2 = /* @__PURE__ */ BigInt(2);
var _4n3 = /* @__PURE__ */ BigInt(4);
var _8n2 = /* @__PURE__ */ BigInt(8);
function isEdValidXY(Fp2, CURVE, x, y) {
  const x2 = Fp2.sqr(x);
  const y2 = Fp2.sqr(y);
  const left = Fp2.add(Fp2.mul(CURVE.a, x2), y2);
  const right = Fp2.add(Fp2.ONE, Fp2.mul(CURVE.d, Fp2.mul(x2, y2)));
  return Fp2.eql(left, right);
}
function edwards(params, extraOpts = {}) {
  validateObject(extraOpts, {}, {}, "extraOpts");
  const opts = extraOpts;
  const validated = createCurveFields("edwards", params, opts, opts.FpFnLE);
  const { Fp: Fp2, Fn } = validated;
  let CURVE = validated.CURVE;
  const { h: cofactor } = CURVE;
  if (FpLegendre(Fp2, CURVE.a) !== 1)
    throw new Error("edwards: CURVE.a must be a square in Fp for complete addition formulas");
  if (FpLegendre(Fp2, CURVE.d) !== -1)
    throw new Error("edwards: CURVE.d must be a non-square in Fp for complete addition formulas");
  validateObject(opts, {}, { uvRatio: "function", randomBytes: "function" });
  const randomBytes6 = opts.randomBytes === void 0 ? randomBytes2 : opts.randomBytes;
  const MASK2 = _2n2 << BigInt(Fp2.BYTES * 8) - _1n4;
  function isOdd(n) {
    if (!Fp2.isOdd)
      throw new Error("Field does not have .isOdd()");
    return Fp2.isOdd(n);
  }
  const uvRatio2 = opts.uvRatio === void 0 ? (u, v) => {
    try {
      return { isValid: true, value: Fp2.sqrt(Fp2.div(u, v)) };
    } catch (e) {
      return { isValid: false, value: _0n4 };
    }
  } : opts.uvRatio;
  if (!isEdValidXY(Fp2, CURVE, CURVE.Gx, CURVE.Gy))
    throw new Error("bad curve params: generator point");
  const mulA = Fp2.eql(CURVE.a, Fp2.neg(Fp2.ONE)) ? (x) => Fp2.neg(x) : Fp2.eql(CURVE.a, Fp2.ONE) ? (x) => x : (x) => Fp2.mul(CURVE.a, x);
  function acoord(title, n, banZero = false) {
    const min = banZero ? _1n4 : _0n4;
    aInRange("coordinate " + title, n, min, MASK2);
    return n;
  }
  function aedpoint(other) {
    if (!(other instanceof Point))
      throw new Error("EdwardsPoint expected");
  }
  class Point {
    static BASE = new Point(CURVE.Gx, CURVE.Gy, Fp2.ONE, Fp2.mul(CURVE.Gx, CURVE.Gy));
    static ZERO = new Point(Fp2.ZERO, Fp2.ONE, Fp2.ONE, Fp2.ZERO);
    static Fp = Fp2;
    static Fn = Fn;
    X;
    Y;
    Z;
    T;
    constructor(X, Y, Z, T) {
      this.X = acoord("x", X);
      this.Y = acoord("y", Y);
      this.Z = acoord("z", Z, true);
      this.T = acoord("t", T);
      Object.freeze(this);
    }
    static CURVE() {
      return CURVE;
    }
    /**
     * Create one extended Edwards point from affine coordinates.
     * Does NOT validate that the point is on-curve or torsion-free.
     * Use `.assertValidity()` on adversarial inputs.
     */
    static fromAffine(p) {
      if (p instanceof Point)
        throw new Error("extended point not allowed");
      const { x, y } = p || {};
      acoord("x", x);
      acoord("y", y);
      return new Point(x, y, Fp2.ONE, Fp2.mul(x, y));
    }
    // Uses algo from RFC8032 5.1.3.
    static fromBytes(bytes, zip215 = false) {
      const len = Fp2.BYTES;
      const { a, d } = CURVE;
      bytes = copyBytes(abytes2(bytes, len, "point"));
      abool(zip215, "zip215");
      const normed = copyBytes(bytes);
      const lastByte = bytes[len - 1];
      normed[len - 1] = lastByte & ~128;
      const y = bytesToNumberLE(normed);
      const max = zip215 ? MASK2 : Fp2.ORDER;
      aInRange("point.y", y, _0n4, max);
      const y2 = Fp2.sqr(y);
      const u = Fp2.sub(y2, Fp2.ONE);
      const v = Fp2.sub(Fp2.mulN(d, y2), a);
      let { isValid, value: x } = uvRatio2(u, v);
      if (!isValid)
        throw new Error("bad point: invalid y coordinate");
      const isXOdd = isOdd(x);
      const isLastByteOdd = (lastByte & 128) !== 0;
      if (!zip215 && Fp2.is0(x) && isLastByteOdd)
        throw new Error("bad point: x=0 and x_0=1");
      if (isLastByteOdd !== isXOdd)
        x = Fp2.neg(x);
      return Point.fromAffine({ x, y });
    }
    static fromHex(hex, zip215 = false) {
      return Point.fromBytes(hexToBytes2(hex), zip215);
    }
    get x() {
      return this.toAffine().x;
    }
    get y() {
      return this.toAffine().y;
    }
    precompute(windowSize = 6, isLazy = true) {
      wnaf.setWindowSize(this, windowSize);
      if (!isLazy)
        this.multiply(_2n2);
      return this;
    }
    // Useful in fromAffine() - not for fromBytes(), which always created valid points.
    assertValidity() {
      const p = this;
      const { a, d } = CURVE;
      if (p.is0())
        throw new Error("bad point: ZERO");
      const { X, Y, Z, T } = p;
      const X2 = Fp2.sqr(X);
      const Y2 = Fp2.sqr(Y);
      const Z2 = Fp2.sqr(Z);
      const Z4 = Fp2.sqr(Z2);
      const aX2 = Fp2.mul(X2, a);
      const left = Fp2.mul(Fp2.add(aX2, Y2), Z2);
      const right = Fp2.add(Z4, Fp2.mul(d, Fp2.mul(X2, Y2)));
      if (!Fp2.eql(left, right))
        throw new Error("bad point: equation left != right (1)");
      const XY = Fp2.mul(X, Y);
      const ZT = Fp2.mul(Z, T);
      if (!Fp2.eql(XY, ZT))
        throw new Error("bad point: equation left != right (2)");
    }
    // Compare one point to another.
    equals(other) {
      aedpoint(other);
      const { X: X1, Y: Y1, Z: Z1 } = this;
      const { X: X2, Y: Y2, Z: Z2 } = other;
      const X1Z2 = Fp2.mul(X1, Z2);
      const X2Z1 = Fp2.mul(X2, Z1);
      const Y1Z2 = Fp2.mul(Y1, Z2);
      const Y2Z1 = Fp2.mul(Y2, Z1);
      return Fp2.eql(X1Z2, X2Z1) && Fp2.eql(Y1Z2, Y2Z1);
    }
    is0() {
      return this.equals(Point.ZERO);
    }
    negate() {
      return new Point(Fp2.neg(this.X), this.Y, this.Z, Fp2.neg(this.T));
    }
    // Fast algo for doubling Extended Point.
    // https://hyperelliptic.org/EFD/g1p/auto-twisted-extended.html#doubling-dbl-2008-hwcd
    // Cost: 4M + 4S + 1*a + 6add + 1*2.
    double() {
      const { X: X1, Y: Y1, Z: Z1 } = this;
      const A = Fp2.sqr(X1);
      const B = Fp2.sqr(Y1);
      const C = Fp2.mul(Fp2.sqr(Z1), _2n2);
      const D = mulA(A);
      const x1y1 = Fp2.addN(X1, Y1);
      const E = Fp2.sub(Fp2.subN(Fp2.sqr(x1y1), A), B);
      const G = Fp2.addN(D, B);
      const F = Fp2.subN(G, C);
      const H = Fp2.subN(D, B);
      const X3 = Fp2.mul(E, F);
      const Y3 = Fp2.mul(G, H);
      const T3 = Fp2.mul(E, H);
      const Z3 = Fp2.mul(F, G);
      return new Point(X3, Y3, Z3, T3);
    }
    // Fast algo for adding 2 Extended Points.
    // https://hyperelliptic.org/EFD/g1p/auto-twisted-extended.html#addition-add-2008-hwcd
    // Cost: 9M + 1*a + 1*d + 7add.
    add(other) {
      aedpoint(other);
      const { d } = CURVE;
      const { X: X1, Y: Y1, Z: Z1, T: T1 } = this;
      const { X: X2, Y: Y2, Z: Z2, T: T2 } = other;
      const A = Fp2.mul(X1, X2);
      const B = Fp2.mul(Y1, Y2);
      const C = Fp2.mul(Fp2.mulN(T1, d), T2);
      const D = Fp2.mul(Z1, Z2);
      const E = Fp2.sub(Fp2.subN(Fp2.mulN(Fp2.addN(X1, Y1), Fp2.addN(X2, Y2)), A), B);
      const F = Fp2.subN(D, C);
      const G = Fp2.addN(D, C);
      const H = Fp2.sub(B, mulA(A));
      const X3 = Fp2.mul(E, F);
      const Y3 = Fp2.mul(G, H);
      const T3 = Fp2.mul(E, H);
      const Z3 = Fp2.mul(F, G);
      return new Point(X3, Y3, Z3, T3);
    }
    subtract(other) {
      aedpoint(other);
      return this.add(other.negate());
    }
    // Constant-time multiplication.
    multiply(scalar) {
      if (!Fn.isValidNot0(scalar))
        throw new RangeError("invalid scalar: expected 1 <= sc < curve.n");
      const { p, f } = wnaf.mulSecret(this, scalar, cofactor, normalize);
      return normalize([p, f])[0];
    }
    // Non-constant-time multiplication. Uses double-and-add algorithm.
    // It's faster, but should only be used when you don't care about
    // an exposed private key e.g. sig verification.
    // Keeps the same subgroup-scalar contract: 0 is allowed for public-scalar callers, but
    // n and larger values are rejected instead of being reduced mod n to the identity point.
    multiplyUnsafe(scalar) {
      if (!Fn.isValid(scalar))
        throw new RangeError("invalid scalar: expected 0 <= sc < curve.n");
      if (scalar === _0n4)
        return Point.ZERO;
      if (this.is0() || scalar === _1n4)
        return this;
      return wnaf.mulUnsafe(this, scalar, normalize);
    }
    // Checks if point is of small order.
    // If you add something to small order point, you will have "dirty"
    // point with torsion component.
    // Clears cofactor and checks if the result is 0.
    isSmallOrder() {
      return this.clearCofactor().is0();
    }
    // Multiplies point by curve order and checks if the result is 0.
    // Returns `false` is the point is dirty.
    isTorsionFree() {
      return wnaf.mulUnsafe(this, CURVE.n).is0();
    }
    // Converts Extended point to default (x, y) coordinates.
    // Can accept precomputed Z^-1 - for example, from invertBatch.
    toAffine(invertedZ) {
      const p = this;
      let iz = invertedZ;
      if (iz != null && typeof iz !== "bigint")
        throw new TypeError('"invertedZ" expected bigint, got type=' + typeof iz);
      const { X, Y, Z } = p;
      const is0 = p.is0();
      if (iz == null)
        iz = is0 ? Fp2.create(_8n2) : Fp2.inv(Z);
      const x = Fp2.mul(X, iz);
      const y = Fp2.mul(Y, iz);
      const zz = Fp2.mul(Z, iz);
      if (is0)
        return { x: Fp2.ZERO, y: Fp2.ONE };
      if (!Fp2.eql(zz, Fp2.ONE))
        throw new Error("invZ was invalid");
      return { x, y };
    }
    clearCofactor() {
      if (cofactor === _1n4)
        return this;
      if (cofactor === _2n2)
        return this.double();
      if (cofactor === _4n3)
        return this.double().double();
      if (cofactor === _8n2)
        return this.double().double().double();
      return this.multiplyUnsafe(cofactor);
    }
    toBytes() {
      const { x, y } = this.toAffine();
      const bytes = Fp2.toBytes(y);
      bytes[bytes.length - 1] |= isOdd(x) ? 128 : 0;
      return bytes;
    }
    toHex() {
      return bytesToHex2(this.toBytes());
    }
    toString() {
      return `<Point ${this.is0() ? "ZERO" : this.toHex()}>`;
    }
  }
  const normalize = (points) => normalizeZ(Point, points);
  const wnaf = new ScalarMultiplier(Point, randomBytes6);
  if (wnaf.bits >= 6)
    Point.BASE.precompute(6);
  Object.freeze(Point.prototype);
  Object.freeze(Point);
  return Point;
}
function eddsa(Point, cHash, eddsaOpts = {}) {
  validatePointCons(Point);
  if (typeof cHash !== "function")
    throw new Error('"hash" function param is required');
  const hash2 = cHash;
  const opts = eddsaOpts;
  validateObject(opts, {}, {
    adjustScalarBytes: "function",
    randomBytes: "function",
    domain: "function",
    prehash: "function",
    zip215: "boolean",
    mapToCurve: "function",
    toMontgomery: "function",
    toMontgomerySecret: "function"
  });
  const { prehash } = opts;
  const { BASE, Fp: Fp2, Fn } = Point;
  const outputLen = hash2.outputLen;
  const expectedLen = 2 * Fp2.BYTES;
  if (outputLen !== void 0) {
    asafenumber(outputLen, "hash.outputLen");
    if (outputLen !== expectedLen)
      throw new Error(`hash.outputLen must be ${expectedLen}, got ${outputLen}`);
  }
  const randomBytes6 = opts.randomBytes === void 0 ? randomBytes2 : opts.randomBytes;
  const toMontgomery2 = opts.toMontgomery;
  const toMontgomerySecret2 = opts.toMontgomerySecret;
  const adjustScalarBytes2 = opts.adjustScalarBytes === void 0 ? (bytes) => bytes : opts.adjustScalarBytes;
  const domain = opts.domain === void 0 ? (data2, ctx, phflag) => {
    abool(phflag, "phflag");
    if (ctx.length || phflag)
      throw new Error("Contexts/pre-hash are not supported");
    return data2;
  } : opts.domain;
  function modN_LE(hash3) {
    return Fn.create(bytesToNumberLE(hash3));
  }
  function getPrivateScalar(key) {
    const len = lengths.secretKey;
    abytes2(key, lengths.secretKey, "secretKey");
    const hashed = abytes2(hash2(key), 2 * len, "hashedSecretKey");
    const head = adjustScalarBytes2(hashed.slice(0, len));
    const prefix = hashed.slice(len, 2 * len);
    const scalar = modN_LE(head);
    return { head, prefix, scalar };
  }
  function getExtendedPublicKey(secretKey) {
    const { head, prefix, scalar } = getPrivateScalar(secretKey);
    const point = BASE.multiply(scalar);
    const pointBytes = point.toBytes();
    return { head, prefix, scalar, point, pointBytes };
  }
  function getPublicKey(secretKey) {
    return getExtendedPublicKey(secretKey).pointBytes;
  }
  function hashDomainToScalar(context = Uint8Array.of(), ...msgs) {
    const msg = concatBytes2(...msgs);
    return modN_LE(hash2(domain(msg, abytes2(context, void 0, "context"), !!prehash)));
  }
  function sign(msg, secretKey, options = {}) {
    validateObject(options, {}, {}, "options");
    msg = copyBytes(abytes2(msg, void 0, "message"));
    if (prehash)
      msg = prehash(msg);
    const { prefix, scalar, pointBytes } = getExtendedPublicKey(secretKey);
    const r = hashDomainToScalar(options.context, prefix, msg);
    const R = BASE.multiply(r).toBytes();
    const k = hashDomainToScalar(options.context, R, pointBytes, msg);
    const s = Fn.create(r + k * scalar);
    if (!Fn.isValid(s))
      throw new Error("sign failed: invalid s");
    const rs = concatBytes2(R, Fn.toBytes(s));
    return abytes2(rs, lengths.signature, "result");
  }
  const verifyOpts = {
    zip215: opts.zip215
  };
  function verify(sig, msg, publicKey, options = verifyOpts) {
    validateObject(options);
    const { context } = options;
    const zip215 = options.zip215 === void 0 ? !!verifyOpts.zip215 : options.zip215;
    const len = lengths.signature;
    sig = abytes2(sig, len, "signature");
    msg = abytes2(msg, void 0, "message");
    publicKey = abytes2(publicKey, lengths.publicKey, "publicKey");
    if (zip215 !== void 0)
      abool(zip215, "zip215");
    if (prehash)
      msg = prehash(msg);
    const mid = len / 2;
    const r = sig.subarray(0, mid);
    const s = bytesToNumberLE(sig.subarray(mid, len));
    let A, R, SB;
    try {
      A = Point.fromBytes(publicKey, zip215);
      R = Point.fromBytes(r, zip215);
      SB = BASE.multiplyUnsafe(s);
    } catch (error2) {
      return false;
    }
    if (!zip215 && A.isSmallOrder())
      return false;
    const k = hashDomainToScalar(context, r, publicKey, msg);
    const RkA = R.add(A.multiplyUnsafe(k));
    return RkA.subtract(SB).clearCofactor().is0();
  }
  const _size = Fp2.BYTES;
  const lengths = {
    secretKey: _size,
    publicKey: _size,
    signature: 2 * _size,
    seed: _size
  };
  function randomSecretKey(seed) {
    seed = seed === void 0 ? randomBytes6(lengths.seed) : seed;
    return abytes2(seed, lengths.seed, "seed");
  }
  function isValidSecretKey(key) {
    return isBytes2(key) && key.length === lengths.secretKey;
  }
  function isValidPublicKey(key, zip215) {
    try {
      return !!Point.fromBytes(key, zip215 === void 0 ? verifyOpts.zip215 : zip215);
    } catch (error2) {
      return false;
    }
  }
  const utils = {
    getExtendedPublicKey,
    randomSecretKey,
    isValidSecretKey,
    isValidPublicKey,
    /** Converts an Edwards public key to a companion Montgomery public key. */
    toMontgomery(publicKey) {
      if (toMontgomery2 === void 0)
        throw new Error("Montgomery conversion is not supported for this curve");
      return toMontgomery2(Point.fromBytes(publicKey));
    },
    toMontgomerySecret(secretKey) {
      if (toMontgomerySecret2 === void 0)
        throw new Error("Montgomery conversion is not supported for this curve");
      return toMontgomerySecret2(secretKey);
    }
  };
  Object.freeze(lengths);
  Object.freeze(utils);
  return Object.freeze({
    keygen: createKeygen(randomSecretKey, getPublicKey),
    getPublicKey,
    sign,
    verify,
    utils,
    Point,
    lengths
  });
}

// ../../node_modules/@noble/curves/abstract/montgomery.js
var _0n5 = /* @__PURE__ */ BigInt(0);
var _1n5 = /* @__PURE__ */ BigInt(1);
var _2n3 = /* @__PURE__ */ BigInt(2);
function cmask(P, swap) {
  return P + swap - (swap >> _1n5 << _1n5);
}
function cswap(P) {
  const offset = BigInt(6) * P;
  return (mask, x_2, x_3) => {
    const sum = x_2 + x_3;
    const d = offset + x_3 - x_2;
    const a = (d * mask + x_2) % P;
    return { x_2: a, x_3: sum - a };
  };
}
function validateOpts(curve) {
  validateObject(curve, {
    P: "bigint",
    type: "string",
    adjustScalarBytes: "function",
    powPminus2: "function"
  }, {
    randomBytes: "function",
    scalarMultBase: "function"
  });
  return Object.freeze({ ...curve });
}
function montgomery(curveDef) {
  const CURVE = validateOpts(curveDef);
  const { P, type, adjustScalarBytes: adjustScalarBytes2, powPminus2, randomBytes: rand } = CURVE;
  const mulBaseHook = CURVE.scalarMultBase;
  const is25519 = type === "x25519";
  if (!is25519 && type !== "x448")
    throw new Error("invalid type");
  const randomBytes_ = rand === void 0 ? randomBytes2 : rand;
  const montgomeryBits = is25519 ? 255 : 448;
  const swap = cswap(P);
  const fieldLen = is25519 ? 32 : 56;
  const Gu = is25519 ? BigInt(9) : BigInt(5);
  const a24 = is25519 ? BigInt(121665) : BigInt(39081);
  const minScalar = is25519 ? _2n3 ** BigInt(254) : _2n3 ** BigInt(447);
  const maxAdded = is25519 ? BigInt(8) * (_2n3 ** BigInt(251) - _1n5) : BigInt(4) * (_2n3 ** BigInt(445) - _1n5);
  const maxScalar = minScalar + maxAdded + _1n5;
  const modP = (n) => mod(n, P);
  const GuBytes = encodeU(Gu);
  function encodeU(u) {
    return numberToBytesLE(modP(u), fieldLen);
  }
  function decodeU(u) {
    const _u = copyBytes(abytes2(u, fieldLen, "uCoordinate"));
    if (is25519)
      _u[31] &= 127;
    return modP(bytesToNumberLE(_u));
  }
  function decodeScalar(scalar) {
    return bytesToNumberLE(adjustScalarBytes2(copyBytes(abytes2(scalar, fieldLen, "scalar"))));
  }
  const lowOrderU = new Set(is25519 ? [
    _0n5,
    _1n5,
    P - _1n5,
    BigInt("325606250916557431795983626356110631294008115727848805560023387167927233504"),
    BigInt("39382357235489614581723060781553021112529911719440698176882885853963445705823")
  ] : [_0n5, _1n5, P - _1n5]);
  function scalarMult(scalar, u) {
    const pointU = decodeU(u);
    if (lowOrderU.has(pointU))
      throw new Error("invalid private or public key received");
    const pu = montgomeryLadder(pointU, decodeScalar(scalar));
    if (pu === _0n5)
      throw new Error("invalid private or public key received");
    return encodeU(pu);
  }
  function scalarMultBase(scalar) {
    if (mulBaseHook === void 0)
      return scalarMult(scalar, GuBytes);
    const k = decodeScalar(scalar);
    aInRange("scalar", k, minScalar, maxScalar);
    const pu = modP(mulBaseHook(k));
    if (pu === _0n5)
      throw new Error("invalid private or public key received");
    return encodeU(pu);
  }
  const getPublicKey = scalarMultBase;
  const getSharedSecret = scalarMult;
  function montgomeryLadder(u, scalar) {
    aInRange("u", u, _0n5, P);
    aInRange("scalar", scalar, minScalar, maxScalar);
    const k = scalar;
    const x_1 = u;
    let x_2 = _1n5;
    let z_2 = _0n5;
    let x_3 = u;
    let z_3 = _1n5;
    const kx = k ^ k >> _1n5;
    for (let t = BigInt(montgomeryBits - 1); t >= _0n5; t--) {
      const mask2 = cmask(P, kx >> t);
      ({ x_2, x_3 } = swap(mask2, x_2, x_3));
      ({ x_2: z_2, x_3: z_3 } = swap(mask2, z_2, z_3));
      const A = x_2 + z_2;
      const AA = modP(A * A);
      const B = x_2 - z_2;
      const BB = modP(B * B);
      const E = AA - BB;
      const C = x_3 + z_3;
      const D = x_3 - z_3;
      const DA = modP(D * A);
      const CB = modP(C * B);
      const dacb = DA + CB;
      const da_cb = DA - CB;
      x_3 = modP(dacb * dacb);
      z_3 = modP(x_1 * modP(da_cb * da_cb));
      x_2 = modP(AA * BB);
      z_2 = modP(E * (AA + modP(a24 * E)));
    }
    const mask = cmask(P, k);
    ({ x_2, x_3 } = swap(mask, x_2, x_3));
    ({ x_2: z_2, x_3: z_3 } = swap(mask, z_2, z_3));
    const z2 = powPminus2(z_2);
    return modP(x_2 * z2);
  }
  const lengths = {
    secretKey: fieldLen,
    publicKey: fieldLen,
    seed: fieldLen
  };
  const randomSecretKey = (seed) => {
    seed = seed === void 0 ? randomBytes_(fieldLen) : seed;
    abytes2(seed, lengths.seed, "seed");
    return seed;
  };
  const utils = { randomSecretKey };
  Object.freeze(lengths);
  Object.freeze(utils);
  return Object.freeze({
    keygen: createKeygen(randomSecretKey, getPublicKey),
    getSharedSecret,
    getPublicKey,
    scalarMult,
    scalarMultBase,
    utils,
    GuBytes: GuBytes.slice(),
    lengths
  });
}

// ../../node_modules/@noble/curves/ed25519.js
var _0n6 = /* @__PURE__ */ BigInt(0);
var _1n6 = /* @__PURE__ */ BigInt(1);
var _2n4 = /* @__PURE__ */ BigInt(2);
var _3n2 = /* @__PURE__ */ BigInt(3);
var _5n2 = /* @__PURE__ */ BigInt(5);
var _8n3 = /* @__PURE__ */ BigInt(8);
var ed25519_CURVE_p = /* @__PURE__ */ BigInt("0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffed");
var ed25519_CURVE = /* @__PURE__ */ (() => ({
  p: ed25519_CURVE_p,
  n: BigInt("0x1000000000000000000000000000000014def9dea2f79cd65812631a5cf5d3ed"),
  h: _8n3,
  a: BigInt("0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffec"),
  d: BigInt("0x52036cee2b6ffe738cc740797779e89800700a4d4141d8ab75eb4dca135978a3"),
  Gx: BigInt("0x216936d3cd6e53fec0a4e231fdd6dc5c692cc7609525a7b2c9562d608f25d51a"),
  Gy: BigInt("0x6666666666666666666666666666666666666666666666666666666666666658")
}))();
function ed25519_pow_2_252_3(x) {
  const _10n = BigInt(10), _20n = BigInt(20), _40n = BigInt(40), _80n = BigInt(80);
  const P = ed25519_CURVE_p;
  const x2 = x * x % P;
  const b2 = x2 * x % P;
  const b4 = pow2(b2, _2n4, P) * b2 % P;
  const b5 = pow2(b4, _1n6, P) * x % P;
  const b10 = pow2(b5, _5n2, P) * b5 % P;
  const b20 = pow2(b10, _10n, P) * b10 % P;
  const b40 = pow2(b20, _20n, P) * b20 % P;
  const b80 = pow2(b40, _40n, P) * b40 % P;
  const b160 = pow2(b80, _80n, P) * b80 % P;
  const b240 = pow2(b160, _80n, P) * b80 % P;
  const b250 = pow2(b240, _10n, P) * b10 % P;
  const pow_p_5_8 = pow2(b250, _2n4, P) * x % P;
  return { pow_p_5_8, b2 };
}
function adjustScalarBytes(bytes) {
  bytes[0] &= 248;
  bytes[31] &= 127;
  bytes[31] |= 64;
  return bytes;
}
var ED25519_SQRT_M1 = /* @__PURE__ */ BigInt("19681161376707505956807079304988542015446066515923890162744021073123829784752");
function uvRatio(u, v) {
  const P = ed25519_CURVE_p;
  const v3 = mod(v * v * v, P);
  const v7 = mod(v3 * v3 * v, P);
  const pow3 = ed25519_pow_2_252_3(u * v7).pow_p_5_8;
  let x = mod(u * v3 * pow3, P);
  const vx2 = mod(v * x * x, P);
  const root1 = x;
  const root2 = mod(x * ED25519_SQRT_M1, P);
  const useRoot1 = vx2 === u;
  const useRoot2 = vx2 === mod(-u, P);
  const noRoot = vx2 === mod(-u * ED25519_SQRT_M1, P);
  if (useRoot1)
    x = root1;
  if (useRoot2 || noRoot)
    x = root2;
  if (isNegativeLE(x, P))
    x = mod(-x, P);
  return { isValid: useRoot1 || useRoot2, value: x };
}
var ed25519_Point = /* @__PURE__ */ edwards(ed25519_CURVE, { uvRatio });
var Fp = /* @__PURE__ */ (() => ed25519_Point.Fp)();
function toMontgomery(point) {
  const { y } = point;
  return Fp.toBytes(Fp.div(_1n6 + y, _1n6 - y));
}
function toMontgomerySecret(secretKey) {
  const size = ed25519_Point.Fp.BYTES;
  abytes(secretKey, size);
  return adjustScalarBytes(sha5122(secretKey.subarray(0, size))).subarray(0, size);
}
function ed(opts) {
  return eddsa(ed25519_Point, sha5122, Object.assign({ adjustScalarBytes, toMontgomery, toMontgomerySecret, zip215: true }, opts));
}
var ed25519 = /* @__PURE__ */ ed({});
var x25519 = /* @__PURE__ */ (() => {
  const P = ed25519_CURVE_p;
  const powPminus2 = (x) => {
    const { pow_p_5_8, b2 } = ed25519_pow_2_252_3(x);
    return mod(pow2(pow_p_5_8, _3n2, P) * b2, P);
  };
  return montgomery({
    P,
    type: "x25519",
    powPminus2,
    adjustScalarBytes,
    // ~3x faster fixed-base: [k]B on the birationally-equivalent Edwards curve using cached
    // base tables, mapped back via u = (1+y)/(1-y) = (Z+Y)/(Z-Y) with one Fermat inversion.
    // Same construction as libsodium's crypto_scalarmult_curve25519_base.
    scalarMultBase: (k) => {
      const kn = mod(k, ed25519_Point.Fn.ORDER);
      if (kn === _0n6)
        return _0n6;
      const p = ed25519_Point.BASE.multiply(kn);
      return mod((p.Z + p.Y) * powPminus2(mod(p.Z - p.Y, P)), P);
    }
  });
})();

// ../../node_modules/@noble/ciphers/utils.js
function isBytes3(a) {
  return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array" && "BYTES_PER_ELEMENT" in a && a.BYTES_PER_ELEMENT === 1;
}
var atitle3 = (title) => title ? `"${title}" ` : "";
function abool2(value, title = "") {
  if (typeof value !== "boolean")
    throw new TypeError(atitle3(title) + "expected boolean, got type=" + typeof value);
  return value;
}
function anumber3(n, title = "") {
  if (typeof n !== "number")
    throw new TypeError(atitle3(title) + "expected number, got " + typeof n);
  if (!Number.isSafeInteger(n) || n < 0)
    throw new RangeError(atitle3(title) + "expected integer >= 0, got " + n);
  return n;
}
function abytes3(value, length, title = "") {
  if (isBytes3(value) && (length === void 0 || value.length === length))
    return value;
  if (length !== void 0)
    anumber3(length, "length");
  const bytes = isBytes3(value);
  const ofLen = length !== void 0 ? ` of length ${length}` : "";
  const got = bytes ? `length=${value.length}` : `type=${typeof value}`;
  const message = atitle3(title) + "expected Uint8Array" + ofLen + ", got " + got;
  if (!bytes)
    throw new TypeError(message);
  throw new RangeError(message);
}
var aobject3 = (value, label) => {
  if (value === null || typeof value !== "object" || Array.isArray(value))
    throw new TypeError(label === "object" ? "expected valid options object" : `"${label}" expected object, got type=${typeof value}`);
};
function aexists2(instance, checkFinished = true) {
  if (instance.destroyed)
    throw new Error("hash was destroyed");
  if (checkFinished && instance.finished)
    throw new Error("digest() was already called");
}
function aoutput2(out, instance) {
  abytes3(out, void 0, "output");
  const min = instance.outputLen;
  if (!(out.length >= min)) {
    throw new RangeError('"output" expected length >= ' + min);
  }
}
function u32(arr) {
  return new Uint32Array(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / 4));
}
function clean2(...arrays) {
  for (let i = 0; i < arrays.length; i++) {
    arrays[i].fill(0);
  }
}
function createView2(arr) {
  return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
}
var isLE = /* @__PURE__ */ (() => new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68)();
function byteSwap(word) {
  return word << 24 & 4278190080 | word << 8 & 16711680 | word >>> 8 & 65280 | word >>> 24 & 255;
}
function byteSwap32(arr) {
  for (let i = 0; i < arr.length; i++) {
    arr[i] = byteSwap(arr[i]);
  }
  return arr;
}
var swap32IfBE = isLE ? (u) => u : byteSwap32;
function overlapBytes(a, b) {
  if (!a.byteLength || !b.byteLength)
    return false;
  return a.buffer === b.buffer && // best we can do, may fail with an obscure Proxy
  a.byteOffset < b.byteOffset + b.byteLength && // a starts before b end
  b.byteOffset < a.byteOffset + a.byteLength;
}
function complexOverlapBytes(input, output) {
  if (overlapBytes(input, output) && input.byteOffset < output.byteOffset)
    throw new Error("complex overlap of input and output is not supported");
}
function checkOpts2(defaults, opts) {
  aobject3(defaults, "defaults");
  aobject3(opts, "opts");
  const merged = Object.assign(defaults, opts);
  return merged;
}
function equalBytes(a, b) {
  a = abytes3(a);
  b = abytes3(b);
  if (a.length !== b.length)
    return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++)
    diff |= a[i] ^ b[i];
  return diff === 0;
}
function wrapMacConstructor(keyLen, macCons, fromMsg) {
  const mac = macCons;
  const getArgs = fromMsg || (() => []);
  const macC = (msg, key) => mac(key, ...getArgs(msg)).update(msg).digest();
  const tmp = mac(new Uint8Array(keyLen), ...getArgs(new Uint8Array(0)));
  macC.outputLen = tmp.outputLen;
  macC.blockLen = tmp.blockLen;
  macC.create = (key, ...args) => mac(key, ...args);
  return macC;
}
var wrapCipher = /* @__NO_SIDE_EFFECTS__ */ (params, constructor) => {
  function wrappedCipher(key, ...args) {
    abytes3(key, void 0, "key");
    if (params.nonceLength !== void 0) {
      const nonce = args[0];
      abytes3(nonce, params.varSizeNonce ? void 0 : params.nonceLength, "nonce");
    }
    const tagl = params.tagLength;
    const aadStart = params.nonceLength !== void 0 ? 1 : 0;
    if (!params.withAAD) {
      for (let i = aadStart; i < args.length; i++)
        if (isBytes3(args[i]))
          throw new Error("AAD not supported");
    }
    if (params.withAAD && args[aadStart] !== void 0)
      abytes3(args[aadStart], void 0, "AAD");
    const cipher = constructor(key, ...args);
    const checkOutput = (fnLength, output) => {
      if (output !== void 0) {
        if (fnLength !== 2)
          throw new Error("cipher output not supported");
        abytes3(output, void 0, "output");
      }
    };
    let called = false;
    const wrCipher = {
      encrypt(data2, output) {
        if (called)
          throw new Error("cannot encrypt() twice with same key + nonce");
        called = true;
        abytes3(data2, void 0, "data");
        checkOutput(cipher.encrypt.length, output);
        return cipher.encrypt(data2, output);
      },
      decrypt(data2, output) {
        abytes3(data2, void 0, "data");
        if (tagl && data2.length < tagl)
          throw new Error('"ciphertext" expected length >= tagLength=' + tagl);
        checkOutput(cipher.decrypt.length, output);
        return cipher.decrypt(data2, output);
      }
    };
    return wrCipher;
  }
  Object.assign(wrappedCipher, params);
  return wrappedCipher;
};
function getOutput(expectedLength, out, onlyAligned = true) {
  if (out === void 0)
    return new Uint8Array(expectedLength);
  abytes3(out, expectedLength, "output");
  if (onlyAligned && !isAligned32(out))
    throw new Error("invalid output, must be aligned");
  return out;
}
function u64Lengths(dataLength, aadLength, isLE2) {
  anumber3(dataLength);
  anumber3(aadLength);
  abool2(isLE2);
  const num = new Uint8Array(16);
  const view = createView2(num);
  view.setBigUint64(0, BigInt(aadLength), isLE2);
  view.setBigUint64(8, BigInt(dataLength), isLE2);
  return num;
}
function isAligned32(bytes) {
  return bytes.byteOffset % 4 === 0;
}
function copyBytes2(bytes) {
  return Uint8Array.from(abytes3(bytes));
}

// ../../node_modules/@noble/ciphers/_arx.js
var encodeStr = (str) => Uint8Array.from(str.split(""), (c) => c.charCodeAt(0));
var sigma16_32 = /* @__PURE__ */ (() => swap32IfBE(u32(encodeStr("expand 16-byte k"))))();
var sigma32_32 = /* @__PURE__ */ (() => swap32IfBE(u32(encodeStr("expand 32-byte k"))))();
function rotl(a, b) {
  return a << b | a >>> 32 - b;
}
var BLOCK_LEN = 64;
var BLOCK_LEN32 = 16;
var MAX_COUNTER = /* @__PURE__ */ (() => 2 ** 32 - 1)();
var U32_EMPTY = /* @__PURE__ */ Uint32Array.of();
function runCipher(core, sigma, key, nonce, data2, output, counter, rounds) {
  const len = data2.length;
  const block = new Uint8Array(BLOCK_LEN);
  const b32 = u32(block);
  const isAligned = isLE && isAligned32(data2) && isAligned32(output);
  const d32 = isAligned ? u32(data2) : U32_EMPTY;
  const o32 = isAligned ? u32(output) : U32_EMPTY;
  if (!isLE) {
    for (let pos = 0; pos < len; counter++) {
      core(sigma, key, nonce, b32, counter, rounds);
      swap32IfBE(b32);
      if (counter >= MAX_COUNTER)
        throw new Error("arx: counter overflow");
      const take = Math.min(BLOCK_LEN, len - pos);
      for (let j = 0, posj; j < take; j++) {
        posj = pos + j;
        output[posj] = data2[posj] ^ block[j];
      }
      pos += take;
    }
    return;
  }
  for (let pos = 0; pos < len; counter++) {
    core(sigma, key, nonce, b32, counter, rounds);
    if (counter >= MAX_COUNTER)
      throw new Error("arx: counter overflow");
    const take = Math.min(BLOCK_LEN, len - pos);
    if (isAligned && take === BLOCK_LEN) {
      const pos32 = pos / 4;
      if (pos % 4 !== 0)
        throw new Error("arx: invalid block position");
      for (let j = 0, posj; j < BLOCK_LEN32; j++) {
        posj = pos32 + j;
        o32[posj] = d32[posj] ^ b32[j];
      }
      pos += BLOCK_LEN;
      continue;
    }
    for (let j = 0, posj; j < take; j++) {
      posj = pos + j;
      output[posj] = data2[posj] ^ block[j];
    }
    pos += take;
  }
}
function createCipher(core, opts) {
  const { allowShortKeys, extendNonceFn, counterLength, counterRight, rounds } = checkOpts2({ allowShortKeys: false, counterLength: 8, counterRight: false, rounds: 20 }, opts);
  if (typeof core !== "function")
    throw new Error("core must be a function");
  anumber3(counterLength);
  anumber3(rounds);
  abool2(counterRight);
  abool2(allowShortKeys);
  return (key, nonce, data2, output, counter = 0) => {
    abytes3(key, void 0, "key");
    abytes3(nonce, void 0, "nonce");
    abytes3(data2, void 0, "data");
    const len = data2.length;
    const hasOutput = output !== void 0;
    output = getOutput(len, output, false);
    if (hasOutput)
      complexOverlapBytes(data2, output);
    anumber3(counter);
    if (counter < 0 || counter >= MAX_COUNTER)
      throw new Error("arx: counter overflow");
    const toClean = [];
    let l = key.length;
    let k;
    let sigma;
    if (l === 32) {
      toClean.push(k = copyBytes2(key));
      sigma = sigma32_32;
    } else if (l === 16 && allowShortKeys) {
      k = new Uint8Array(32);
      k.set(key);
      k.set(key, 16);
      sigma = sigma16_32;
      toClean.push(k);
    } else {
      abytes3(key, 32, "arx key");
      throw new Error("invalid key size");
    }
    if (!isLE || !isAligned32(nonce))
      toClean.push(nonce = copyBytes2(nonce));
    let k32 = u32(k);
    if (extendNonceFn) {
      if (nonce.length !== 24)
        throw new Error("arx: extended nonce must be 24 bytes");
      const n16 = nonce.subarray(0, 16);
      if (isLE)
        extendNonceFn(sigma, k32, u32(n16), k32);
      else {
        const sigmaRaw = swap32IfBE(Uint32Array.from(sigma));
        extendNonceFn(sigmaRaw, k32, u32(n16), k32);
        clean2(sigmaRaw);
        swap32IfBE(k32);
      }
      nonce = nonce.subarray(16);
    } else if (!isLE)
      swap32IfBE(k32);
    const nonceNcLen = 16 - counterLength;
    if (nonceNcLen !== nonce.length)
      throw new Error(`arx: nonce must be ${nonceNcLen} or 16 bytes`);
    if (nonceNcLen !== 12) {
      const nc = new Uint8Array(12);
      nc.set(nonce, counterRight ? 0 : 12 - nonce.length);
      nonce = nc;
      toClean.push(nonce);
    }
    const n32 = swap32IfBE(u32(nonce));
    try {
      runCipher(core, sigma, k32, n32, data2, output, counter, rounds);
      return output;
    } finally {
      clean2(...toClean);
    }
  };
}

// ../../node_modules/@noble/ciphers/_poly1305.js
function u8to16(a, i) {
  return a[i++] & 255 | (a[i++] & 255) << 8;
}
var Poly1305 = class {
  blockLen = 16;
  outputLen = 16;
  buffer = new Uint8Array(16);
  r = new Uint16Array(10);
  // Allocating 1 array with .subarray() here is slower than 3
  h = new Uint16Array(10);
  pad = new Uint16Array(8);
  pos = 0;
  finished = false;
  destroyed = false;
  // Can be speed-up using BigUint64Array, at the cost of complexity
  constructor(key) {
    key = copyBytes2(abytes3(key, 32, "key"));
    const t0 = u8to16(key, 0);
    const t1 = u8to16(key, 2);
    const t2 = u8to16(key, 4);
    const t3 = u8to16(key, 6);
    const t4 = u8to16(key, 8);
    const t5 = u8to16(key, 10);
    const t6 = u8to16(key, 12);
    const t7 = u8to16(key, 14);
    this.r[0] = t0 & 8191;
    this.r[1] = (t0 >>> 13 | t1 << 3) & 8191;
    this.r[2] = (t1 >>> 10 | t2 << 6) & 7939;
    this.r[3] = (t2 >>> 7 | t3 << 9) & 8191;
    this.r[4] = (t3 >>> 4 | t4 << 12) & 255;
    this.r[5] = t4 >>> 1 & 8190;
    this.r[6] = (t4 >>> 14 | t5 << 2) & 8191;
    this.r[7] = (t5 >>> 11 | t6 << 5) & 8065;
    this.r[8] = (t6 >>> 8 | t7 << 8) & 8191;
    this.r[9] = t7 >>> 5 & 127;
    for (let i = 0; i < 8; i++)
      this.pad[i] = u8to16(key, 16 + 2 * i);
  }
  process(data2, offset, isLast = false) {
    const hibit = isLast ? 0 : 1 << 11;
    const { h, r } = this;
    const r0 = r[0];
    const r1 = r[1];
    const r2 = r[2];
    const r3 = r[3];
    const r4 = r[4];
    const r5 = r[5];
    const r6 = r[6];
    const r7 = r[7];
    const r8 = r[8];
    const r9 = r[9];
    const t0 = u8to16(data2, offset + 0);
    const t1 = u8to16(data2, offset + 2);
    const t2 = u8to16(data2, offset + 4);
    const t3 = u8to16(data2, offset + 6);
    const t4 = u8to16(data2, offset + 8);
    const t5 = u8to16(data2, offset + 10);
    const t6 = u8to16(data2, offset + 12);
    const t7 = u8to16(data2, offset + 14);
    let h0 = h[0] + (t0 & 8191);
    let h1 = h[1] + ((t0 >>> 13 | t1 << 3) & 8191);
    let h2 = h[2] + ((t1 >>> 10 | t2 << 6) & 8191);
    let h3 = h[3] + ((t2 >>> 7 | t3 << 9) & 8191);
    let h4 = h[4] + ((t3 >>> 4 | t4 << 12) & 8191);
    let h5 = h[5] + (t4 >>> 1 & 8191);
    let h6 = h[6] + ((t4 >>> 14 | t5 << 2) & 8191);
    let h7 = h[7] + ((t5 >>> 11 | t6 << 5) & 8191);
    let h8 = h[8] + ((t6 >>> 8 | t7 << 8) & 8191);
    let h9 = h[9] + (t7 >>> 5 | hibit);
    let c = 0;
    let d0 = c + h0 * r0 + h1 * (5 * r9) + h2 * (5 * r8) + h3 * (5 * r7) + h4 * (5 * r6);
    c = d0 >>> 13;
    d0 &= 8191;
    d0 += h5 * (5 * r5) + h6 * (5 * r4) + h7 * (5 * r3) + h8 * (5 * r2) + h9 * (5 * r1);
    c += d0 >>> 13;
    d0 &= 8191;
    let d1 = c + h0 * r1 + h1 * r0 + h2 * (5 * r9) + h3 * (5 * r8) + h4 * (5 * r7);
    c = d1 >>> 13;
    d1 &= 8191;
    d1 += h5 * (5 * r6) + h6 * (5 * r5) + h7 * (5 * r4) + h8 * (5 * r3) + h9 * (5 * r2);
    c += d1 >>> 13;
    d1 &= 8191;
    let d2 = c + h0 * r2 + h1 * r1 + h2 * r0 + h3 * (5 * r9) + h4 * (5 * r8);
    c = d2 >>> 13;
    d2 &= 8191;
    d2 += h5 * (5 * r7) + h6 * (5 * r6) + h7 * (5 * r5) + h8 * (5 * r4) + h9 * (5 * r3);
    c += d2 >>> 13;
    d2 &= 8191;
    let d3 = c + h0 * r3 + h1 * r2 + h2 * r1 + h3 * r0 + h4 * (5 * r9);
    c = d3 >>> 13;
    d3 &= 8191;
    d3 += h5 * (5 * r8) + h6 * (5 * r7) + h7 * (5 * r6) + h8 * (5 * r5) + h9 * (5 * r4);
    c += d3 >>> 13;
    d3 &= 8191;
    let d4 = c + h0 * r4 + h1 * r3 + h2 * r2 + h3 * r1 + h4 * r0;
    c = d4 >>> 13;
    d4 &= 8191;
    d4 += h5 * (5 * r9) + h6 * (5 * r8) + h7 * (5 * r7) + h8 * (5 * r6) + h9 * (5 * r5);
    c += d4 >>> 13;
    d4 &= 8191;
    let d5 = c + h0 * r5 + h1 * r4 + h2 * r3 + h3 * r2 + h4 * r1;
    c = d5 >>> 13;
    d5 &= 8191;
    d5 += h5 * r0 + h6 * (5 * r9) + h7 * (5 * r8) + h8 * (5 * r7) + h9 * (5 * r6);
    c += d5 >>> 13;
    d5 &= 8191;
    let d6 = c + h0 * r6 + h1 * r5 + h2 * r4 + h3 * r3 + h4 * r2;
    c = d6 >>> 13;
    d6 &= 8191;
    d6 += h5 * r1 + h6 * r0 + h7 * (5 * r9) + h8 * (5 * r8) + h9 * (5 * r7);
    c += d6 >>> 13;
    d6 &= 8191;
    let d7 = c + h0 * r7 + h1 * r6 + h2 * r5 + h3 * r4 + h4 * r3;
    c = d7 >>> 13;
    d7 &= 8191;
    d7 += h5 * r2 + h6 * r1 + h7 * r0 + h8 * (5 * r9) + h9 * (5 * r8);
    c += d7 >>> 13;
    d7 &= 8191;
    let d8 = c + h0 * r8 + h1 * r7 + h2 * r6 + h3 * r5 + h4 * r4;
    c = d8 >>> 13;
    d8 &= 8191;
    d8 += h5 * r3 + h6 * r2 + h7 * r1 + h8 * r0 + h9 * (5 * r9);
    c += d8 >>> 13;
    d8 &= 8191;
    let d9 = c + h0 * r9 + h1 * r8 + h2 * r7 + h3 * r6 + h4 * r5;
    c = d9 >>> 13;
    d9 &= 8191;
    d9 += h5 * r4 + h6 * r3 + h7 * r2 + h8 * r1 + h9 * r0;
    c += d9 >>> 13;
    d9 &= 8191;
    c = (c << 2) + c | 0;
    c = c + d0 | 0;
    d0 = c & 8191;
    c = c >>> 13;
    d1 += c;
    h[0] = d0;
    h[1] = d1;
    h[2] = d2;
    h[3] = d3;
    h[4] = d4;
    h[5] = d5;
    h[6] = d6;
    h[7] = d7;
    h[8] = d8;
    h[9] = d9;
  }
  finalize() {
    const { h, pad } = this;
    const g = new Uint16Array(10);
    let c = h[1] >>> 13;
    h[1] &= 8191;
    for (let i = 2; i < 10; i++) {
      h[i] += c;
      c = h[i] >>> 13;
      h[i] &= 8191;
    }
    h[0] += c * 5;
    c = h[0] >>> 13;
    h[0] &= 8191;
    h[1] += c;
    c = h[1] >>> 13;
    h[1] &= 8191;
    h[2] += c;
    g[0] = h[0] + 5;
    c = g[0] >>> 13;
    g[0] &= 8191;
    for (let i = 1; i < 10; i++) {
      g[i] = h[i] + c;
      c = g[i] >>> 13;
      g[i] &= 8191;
    }
    g[9] -= 1 << 13;
    let mask = (c ^ 1) - 1;
    for (let i = 0; i < 10; i++)
      g[i] &= mask;
    mask = ~mask;
    for (let i = 0; i < 10; i++)
      h[i] = h[i] & mask | g[i];
    h[0] = (h[0] | h[1] << 13) & 65535;
    h[1] = (h[1] >>> 3 | h[2] << 10) & 65535;
    h[2] = (h[2] >>> 6 | h[3] << 7) & 65535;
    h[3] = (h[3] >>> 9 | h[4] << 4) & 65535;
    h[4] = (h[4] >>> 12 | h[5] << 1 | h[6] << 14) & 65535;
    h[5] = (h[6] >>> 2 | h[7] << 11) & 65535;
    h[6] = (h[7] >>> 5 | h[8] << 8) & 65535;
    h[7] = (h[8] >>> 8 | h[9] << 5) & 65535;
    let f = h[0] + pad[0];
    h[0] = f & 65535;
    for (let i = 1; i < 8; i++) {
      f = (h[i] + pad[i] | 0) + (f >>> 16) | 0;
      h[i] = f & 65535;
    }
    clean2(g);
  }
  update(data2) {
    aexists2(this);
    abytes3(data2);
    data2 = copyBytes2(data2);
    const { buffer, blockLen } = this;
    const len = data2.length;
    for (let pos = 0; pos < len; ) {
      const take = Math.min(blockLen - this.pos, len - pos);
      if (take === blockLen) {
        for (; blockLen <= len - pos; pos += blockLen)
          this.process(data2, pos);
        continue;
      }
      buffer.set(data2.subarray(pos, pos + take), this.pos);
      this.pos += take;
      pos += take;
      if (this.pos === blockLen) {
        this.process(buffer, 0, false);
        this.pos = 0;
      }
    }
    return this;
  }
  destroy() {
    this.destroyed = true;
    clean2(this.h, this.r, this.buffer, this.pad);
  }
  digestInto(out) {
    aexists2(this);
    aoutput2(out, this);
    this.finished = true;
    const { buffer, h } = this;
    let { pos } = this;
    if (pos) {
      buffer[pos++] = 1;
      for (; pos < 16; pos++)
        buffer[pos] = 0;
      this.process(buffer, 0, true);
    }
    this.finalize();
    let opos = 0;
    for (let i = 0; i < 8; i++) {
      out[opos++] = h[i] >>> 0;
      out[opos++] = h[i] >>> 8;
    }
  }
  digest() {
    const { buffer, outputLen } = this;
    this.digestInto(buffer);
    const res = buffer.slice(0, outputLen);
    this.destroy();
    return res;
  }
};
var poly1305 = /* @__PURE__ */ wrapMacConstructor(32, (key) => new Poly1305(key));

// ../../node_modules/@noble/ciphers/chacha.js
function chachaCore(s, k, n, out, cnt, rounds = 20) {
  let y00 = s[0], y01 = s[1], y02 = s[2], y03 = s[3], y04 = k[0], y05 = k[1], y06 = k[2], y07 = k[3], y08 = k[4], y09 = k[5], y10 = k[6], y11 = k[7], y12 = cnt, y13 = n[0], y14 = n[1], y15 = n[2];
  let x00 = y00, x01 = y01, x02 = y02, x03 = y03, x04 = y04, x05 = y05, x06 = y06, x07 = y07, x08 = y08, x09 = y09, x10 = y10, x11 = y11, x12 = y12, x13 = y13, x14 = y14, x15 = y15;
  for (let r = 0; r < rounds; r += 2) {
    x00 = x00 + x04 | 0;
    x12 = rotl(x12 ^ x00, 16);
    x08 = x08 + x12 | 0;
    x04 = rotl(x04 ^ x08, 12);
    x00 = x00 + x04 | 0;
    x12 = rotl(x12 ^ x00, 8);
    x08 = x08 + x12 | 0;
    x04 = rotl(x04 ^ x08, 7);
    x01 = x01 + x05 | 0;
    x13 = rotl(x13 ^ x01, 16);
    x09 = x09 + x13 | 0;
    x05 = rotl(x05 ^ x09, 12);
    x01 = x01 + x05 | 0;
    x13 = rotl(x13 ^ x01, 8);
    x09 = x09 + x13 | 0;
    x05 = rotl(x05 ^ x09, 7);
    x02 = x02 + x06 | 0;
    x14 = rotl(x14 ^ x02, 16);
    x10 = x10 + x14 | 0;
    x06 = rotl(x06 ^ x10, 12);
    x02 = x02 + x06 | 0;
    x14 = rotl(x14 ^ x02, 8);
    x10 = x10 + x14 | 0;
    x06 = rotl(x06 ^ x10, 7);
    x03 = x03 + x07 | 0;
    x15 = rotl(x15 ^ x03, 16);
    x11 = x11 + x15 | 0;
    x07 = rotl(x07 ^ x11, 12);
    x03 = x03 + x07 | 0;
    x15 = rotl(x15 ^ x03, 8);
    x11 = x11 + x15 | 0;
    x07 = rotl(x07 ^ x11, 7);
    x00 = x00 + x05 | 0;
    x15 = rotl(x15 ^ x00, 16);
    x10 = x10 + x15 | 0;
    x05 = rotl(x05 ^ x10, 12);
    x00 = x00 + x05 | 0;
    x15 = rotl(x15 ^ x00, 8);
    x10 = x10 + x15 | 0;
    x05 = rotl(x05 ^ x10, 7);
    x01 = x01 + x06 | 0;
    x12 = rotl(x12 ^ x01, 16);
    x11 = x11 + x12 | 0;
    x06 = rotl(x06 ^ x11, 12);
    x01 = x01 + x06 | 0;
    x12 = rotl(x12 ^ x01, 8);
    x11 = x11 + x12 | 0;
    x06 = rotl(x06 ^ x11, 7);
    x02 = x02 + x07 | 0;
    x13 = rotl(x13 ^ x02, 16);
    x08 = x08 + x13 | 0;
    x07 = rotl(x07 ^ x08, 12);
    x02 = x02 + x07 | 0;
    x13 = rotl(x13 ^ x02, 8);
    x08 = x08 + x13 | 0;
    x07 = rotl(x07 ^ x08, 7);
    x03 = x03 + x04 | 0;
    x14 = rotl(x14 ^ x03, 16);
    x09 = x09 + x14 | 0;
    x04 = rotl(x04 ^ x09, 12);
    x03 = x03 + x04 | 0;
    x14 = rotl(x14 ^ x03, 8);
    x09 = x09 + x14 | 0;
    x04 = rotl(x04 ^ x09, 7);
  }
  let oi = 0;
  out[oi++] = y00 + x00 | 0;
  out[oi++] = y01 + x01 | 0;
  out[oi++] = y02 + x02 | 0;
  out[oi++] = y03 + x03 | 0;
  out[oi++] = y04 + x04 | 0;
  out[oi++] = y05 + x05 | 0;
  out[oi++] = y06 + x06 | 0;
  out[oi++] = y07 + x07 | 0;
  out[oi++] = y08 + x08 | 0;
  out[oi++] = y09 + x09 | 0;
  out[oi++] = y10 + x10 | 0;
  out[oi++] = y11 + x11 | 0;
  out[oi++] = y12 + x12 | 0;
  out[oi++] = y13 + x13 | 0;
  out[oi++] = y14 + x14 | 0;
  out[oi++] = y15 + x15 | 0;
}
function hchacha(s, k, i, out) {
  const s2 = isLE ? s : swap32IfBE(s.slice(0, 4));
  const k2 = isLE ? k : swap32IfBE(k.slice(0, 8));
  const i2 = isLE ? i : swap32IfBE(i.slice(0, 4));
  const t = new Uint32Array(16);
  chachaCore(s2, k2, i2.subarray(1), t, i2[0]);
  let oi = 0;
  out[oi++] = t[0] - s2[0] | 0;
  out[oi++] = t[1] - s2[1] | 0;
  out[oi++] = t[2] - s2[2] | 0;
  out[oi++] = t[3] - s2[3] | 0;
  out[oi++] = t[12] - i2[0] | 0;
  out[oi++] = t[13] - i2[1] | 0;
  out[oi++] = t[14] - i2[2] | 0;
  out[oi++] = t[15] - i2[3] | 0;
  swap32IfBE(out);
  if (!isLE)
    clean2(s2, k2, i2);
  clean2(t);
}
var xchacha20 = /* @__PURE__ */ createCipher(chachaCore, {
  counterRight: false,
  counterLength: 8,
  extendNonceFn: hchacha,
  allowShortKeys: false
});
var ZEROS16 = /* @__PURE__ */ new Uint8Array(16);
var updatePadded = (h, msg) => {
  h.update(msg);
  const leftover = msg.length % 16;
  if (leftover)
    h.update(ZEROS16.subarray(leftover));
};
var ZEROS32 = /* @__PURE__ */ new Uint8Array(32);
function computeTag(fn, key, nonce, ciphertext, AAD2) {
  if (AAD2 !== void 0)
    abytes3(AAD2, void 0, "AAD");
  const authKey = fn(key, nonce, ZEROS32);
  const lengths = u64Lengths(ciphertext.length, AAD2 ? AAD2.length : 0, true);
  const h = poly1305.create(authKey);
  if (AAD2)
    updatePadded(h, AAD2);
  updatePadded(h, ciphertext);
  h.update(lengths);
  const res = h.digest();
  clean2(authKey, lengths);
  return res;
}
var _poly1305_aead = (xorStream) => (key, nonce, AAD2) => {
  const tagLength = 16;
  return {
    encrypt(plaintext, output) {
      const plength = plaintext.length;
      output = getOutput(plength + tagLength, output, false);
      output.set(plaintext);
      const oPlain = output.subarray(0, -tagLength);
      xorStream(key, nonce, oPlain, oPlain, 1);
      const tag = computeTag(xorStream, key, nonce, oPlain, AAD2);
      output.set(tag, plength);
      clean2(tag);
      return output;
    },
    decrypt(ciphertext, output) {
      output = getOutput(ciphertext.length - tagLength, output, false);
      const data2 = ciphertext.subarray(0, -tagLength);
      const passedTag = ciphertext.subarray(-tagLength);
      const tag = computeTag(xorStream, key, nonce, data2, AAD2);
      if (!equalBytes(passedTag, tag)) {
        clean2(tag);
        throw new Error("invalid tag");
      }
      output.set(ciphertext.subarray(0, -tagLength));
      xorStream(key, nonce, output, output, 1);
      clean2(tag);
      return output;
    }
  };
};
var xchacha20poly1305 = /* @__PURE__ */ wrapCipher(
  { blockSize: 64, nonceLength: 24, tagLength: 16, withAAD: true },
  /* @__PURE__ */ _poly1305_aead(xchacha20)
);

// ../../node_modules/@noble/hashes/hmac.js
init_utils();
var _HMAC = class {
  oHash;
  iHash;
  blockLen;
  outputLen;
  canXOF = false;
  finished = false;
  destroyed = false;
  constructor(hash2, key) {
    ahash(hash2);
    abytes(key, void 0, "key");
    this.iHash = hash2.create();
    if (typeof this.iHash.update !== "function")
      throw new Error("expected Hash instance");
    this.blockLen = this.iHash.blockLen;
    this.outputLen = this.iHash.outputLen;
    const blockLen = this.blockLen;
    const pad = new Uint8Array(blockLen);
    pad.set(key.length > blockLen ? hash2.create().update(key).digest() : key);
    for (let i = 0; i < pad.length; i++)
      pad[i] ^= 54;
    this.iHash.update(pad);
    this.oHash = hash2.create();
    for (let i = 0; i < pad.length; i++)
      pad[i] ^= 54 ^ 92;
    this.oHash.update(pad);
    clean(pad);
  }
  update(buf) {
    aexists(this);
    this.iHash.update(buf);
    return this;
  }
  digestInto(out) {
    aexists(this);
    aoutput(out, this);
    this.finished = true;
    const buf = out.subarray(0, this.outputLen);
    this.iHash.digestInto(buf);
    this.oHash.update(buf);
    this.oHash.digestInto(buf);
    this.destroy();
  }
  digest() {
    const out = new Uint8Array(this.oHash.outputLen);
    this.digestInto(out);
    return out;
  }
  _cloneInto(to) {
    to ||= Object.create(Object.getPrototypeOf(this), {});
    const { oHash, iHash, finished, destroyed, blockLen, outputLen, canXOF } = this;
    to = to;
    to.finished = finished;
    to.destroyed = destroyed;
    to.blockLen = blockLen;
    to.outputLen = outputLen;
    to.canXOF = canXOF;
    to.oHash = oHash._cloneInto(to.oHash);
    to.iHash = iHash._cloneInto(to.iHash);
    return to;
  }
  clone() {
    return this._cloneInto();
  }
  destroy() {
    this.destroyed = true;
    this.oHash.destroy();
    this.iHash.destroy();
  }
};
var hmac = /* @__PURE__ */ (() => {
  const hmac_ = ((hash2, key, message) => new _HMAC(hash2, key).update(message).digest());
  hmac_.create = (hash2, key) => new _HMAC(hash2, key);
  return hmac_;
})();

// ../../node_modules/@noble/hashes/hkdf.js
init_utils();
var HKDF_COUNTER = /* @__PURE__ */ Uint8Array.of(0);
var EMPTY_BUFFER = /* @__PURE__ */ Uint8Array.of();
function expand(hash2, prk, info2, length = 32, _recycled) {
  ahash(hash2);
  anumber(length, "length");
  abytes(prk, void 0, "prk");
  const olen = hash2.outputLen;
  if (prk.length < olen)
    throw new Error('"prk" must be at least HashLen octets');
  if (length > 255 * olen)
    throw new Error("Length must be <= 255*HashLen");
  const blocks = Math.ceil(length / olen);
  if (info2 === void 0)
    info2 = EMPTY_BUFFER;
  else
    abytes(info2, void 0, "info");
  if (!blocks) {
    if (_recycled)
      clean(prk);
    return new Uint8Array();
  }
  const okm = _recycled && blocks === 1 ? prk : new Uint8Array(blocks * olen);
  const { iHash, oHash } = hmac.create(hash2, prk);
  const T = _recycled ? prk : new Uint8Array(olen);
  const worker = blocks > 1 ? _recycled?.iHash || hash2.create() : void 0;
  for (let counter = 0; counter < blocks - 1; counter++) {
    HKDF_COUNTER[0] = counter + 1;
    const iWork = iHash._cloneInto(worker);
    if (counter)
      iWork.update(T);
    iWork.update(info2).update(HKDF_COUNTER).digestInto(T);
    oHash._cloneInto(worker).update(T).digestInto(T);
    okm.set(T, olen * counter);
  }
  HKDF_COUNTER[0] = blocks;
  if (blocks > 1)
    iHash.update(T);
  iHash.update(info2).update(HKDF_COUNTER).digestInto(T);
  oHash.update(T).digestInto(T);
  okm.set(T, olen * (blocks - 1));
  iHash.destroy();
  oHash.destroy();
  worker?.destroy();
  if (T !== okm)
    clean(T);
  clean(HKDF_COUNTER);
  if (length === okm.length)
    return okm;
  const res = okm.slice(0, length);
  clean(okm);
  return res;
}
var hkdf = (hash2, ikm, salt, info2, length) => {
  ahash(hash2);
  if (salt === void 0)
    salt = new Uint8Array(hash2.outputLen);
  const HMAC = hmac.create(hash2, salt).update(ikm);
  return expand(hash2, HMAC.digest(), info2, length, HMAC);
};

// ../sdk/src/crypto/primitives.ts
init_sha2();
var hkdf2 = (ikm, salt, info2, length = 32) => hkdf(sha2562, ikm, salt, utf8(info2), length);
var aeadDecrypt = (key, nonce, ciphertext, aad) => xchacha20poly1305(key, nonce, utf8(aad)).decrypt(ciphertext);
var x25519PublicKey = (sk) => x25519.getPublicKey(sk);
var x25519Shared = (sk, pk) => x25519.getSharedSecret(sk, pk);
var ed25519PublicKey = (seed) => ed25519.getPublicKey(seed);
var ed25519Sign = (message, seed) => ed25519.sign(message, seed);
var ed25519Verify = (sig, message, pk) => {
  try {
    return ed25519.verify(sig, message, pk);
  } catch {
    return false;
  }
};
var NONCE_BYTES = 24;

// ../sdk/src/crypto/envelope.ts
var VERSION = 1;
function decrypt(key, nonce, ct, aad) {
  try {
    return aeadDecrypt(key, nonce, ct, aad);
  } catch (e) {
    throw new OpenVireoError("decryption_failed", "decryption failed (wrong key, wrong AAD or corrupted data)", void 0, {
      cause: e
    });
  }
}
function checkVersion(blob, minLength) {
  if (blob.length === 0 || blob[0] !== VERSION) {
    throw new OpenVireoError("unsupported_version", `unsupported envelope version ${blob[0] ?? "(empty)"}`);
  }
  if (blob.length < minLength) throw new OpenVireoError("decryption_failed", "envelope too short");
}
function unwrap(key, blob, aad) {
  checkVersion(blob, 1 + NONCE_BYTES + 16);
  return decrypt(key, blob.subarray(1, 1 + NONCE_BYTES), blob.subarray(1 + NONCE_BYTES), aad);
}
function sealKey(shared, epk, recipientPk) {
  if (shared.every((b) => b === 0)) throw new OpenVireoError("low_order_point", "X25519 result is all zero");
  return hkdf2(shared, concat(epk, recipientPk), "ov-seal-v1", 32);
}
function sharedSecret(sk, pk) {
  try {
    return x25519Shared(sk, pk);
  } catch (e) {
    throw new OpenVireoError("low_order_point", "invalid X25519 public key", void 0, { cause: e });
  }
}
function sealDerivedKey(recipientEncSk, sealed) {
  checkVersion(sealed, 1 + 32 + NONCE_BYTES + 16);
  const epk = sealed.subarray(1, 33);
  const shared = sharedSecret(recipientEncSk, epk);
  try {
    return sealKey(shared, epk, x25519PublicKey(recipientEncSk));
  } finally {
    wipe(shared);
  }
}
function unseal(recipientEncSk, sealed, aad) {
  const key = sealDerivedKey(recipientEncSk, sealed);
  try {
    return decrypt(key, sealed.subarray(33, 33 + NONCE_BYTES), sealed.subarray(33 + NONCE_BYTES), aad);
  } finally {
    wipe(key);
  }
}
var AAD = {
  keyset: "ov-keyset-v1",
  vaultKey: (vaultId) => `ov-vault-key|${vaultId}`,
  vaultName: (vaultId) => `ov-vault-name|${vaultId}`,
  saMaster: (saId) => `ov-sa-master-v1|${saId}`
};
var unsealVaultKey = (encSk, vaultId, sealed) => unseal(encSk, sealed, AAD.vaultKey(vaultId));

// ../sdk/src/crypto/keyset.ts
var pubkeysMessage = (encPk, signPk) => concat(utf8("ov-pubkeys-v1"), encPk, signPk);
function keysetFromSecrets(encSk, signSeed) {
  const encPk = x25519PublicKey(encSk);
  const signPk = ed25519PublicKey(signSeed);
  const sig = ed25519Sign(pubkeysMessage(encPk, signPk), signSeed);
  return { encSk: encSk.slice(), signSeed: signSeed.slice(), encPk, signPk, sig };
}
function verifyPublicKeys(pub) {
  if (pub.encPk.length !== 32 || pub.signPk.length !== 32 || pub.sig.length !== 64) return false;
  return ed25519Verify(pub.sig, pubkeysMessage(pub.encPk, pub.signPk), pub.signPk);
}
function publicKeysFromJson(j) {
  return { encPk: fromB64u(j.enc_pk), signPk: fromB64u(j.sign_pk), sig: fromB64u(j.sig) };
}
function unwrapKeyset(key, w) {
  const plain = unwrap(key, fromB64u(w.wrapped), AAD.keyset);
  if (plain.length !== 64) {
    wipe(plain);
    throw new OpenVireoError("invalid_public_keys", "wrapped keyset has the wrong length");
  }
  const ks = keysetFromSecrets(plain.subarray(0, 32), plain.subarray(32, 64));
  wipe(plain);
  const stored = publicKeysFromJson(w);
  if (!ctEqual(ks.encPk, stored.encPk) || !ctEqual(ks.signPk, stored.signPk) || !verifyPublicKeys(stored)) {
    wipeKeyset(ks);
    throw new OpenVireoError("invalid_public_keys", "keyset public keys don't match its private keys");
  }
  ks.sig = stored.sig;
  return ks;
}
function wipeKeyset(ks) {
  if (ks) wipe(ks.encSk, ks.signSeed);
}

// ../sdk/src/crypto/vault-name.ts
var vaultNameKey = (vaultKey) => hkdf2(vaultKey, new Uint8Array(0), "ov-vault-name-v1", 32);
function decryptVaultName(vaultKey, vaultId, encryptedName) {
  const k = vaultNameKey(vaultKey);
  try {
    return fromUtf8(unwrap(k, fromB64u(encryptedName), AAD.vaultName(vaultId)));
  } finally {
    wipe(k);
  }
}

// ../sdk/src/crypto/tokens.ts
var SA_TOKEN_PREFIX = "ov_sa_";
function parseSaToken(token) {
  const t = token.trim();
  if (!t.startsWith(SA_TOKEN_PREFIX)) throw new OpenVireoError("invalid_token", "not a service account token (ov_sa_\u2026)");
  let p;
  try {
    p = JSON.parse(fromUtf8(fromB64u(t.slice(SA_TOKEN_PREFIX.length))));
  } catch (e) {
    throw new OpenVireoError("invalid_token", "malformed service account token", void 0, { cause: e });
  }
  if (p.v !== 1) throw new OpenVireoError("invalid_token", `unsupported service account token version ${String(p.v)}`);
  if (typeof p.url !== "string" || typeof p.sa_id !== "string" || typeof p.secret !== "string" || typeof p.kek !== "string") {
    throw new OpenVireoError("invalid_token", "service account token is missing fields");
  }
  const secret = fromB64u(p.secret);
  const kek = fromB64u(p.kek);
  if (secret.length !== 32 || kek.length !== 32) throw new OpenVireoError("invalid_token", "service account token keys must be 32 bytes");
  return { url: p.url, saId: p.sa_id, secret, kek };
}
var unwrapSaMaster = (kek, saId, wrapped) => unwrap(kek, fromB64u(wrapped), AAD.saMaster(saId));

// ../sdk/src/http/request.ts
var HttpError = class extends OpenVireoError {
  constructor(code, message, status, body, retryAfter) {
    super(code, message, status, { details: errorDetails(code, body) });
    this.body = body;
    this.retryAfter = retryAfter;
  }
};
function errorDetails(code, body) {
  const b = body;
  if (code === "recovery_not_ready" && typeof b?.not_before === "string") return { notBefore: b.not_before };
  if (code === "plan_limit" && b) {
    return { limit: b.limit, max: b.max, current: b.current, plan: b.plan, upgradeUrl: b.upgrade_url };
  }
  if (code === "quota_exceeded" && typeof b?.max === "number") return { max: b.max };
  return void 0;
}
var codeForStatus = (status) => ({
  400: "invalid_request",
  401: "unauthorized",
  402: "plan_limit",
  403: "forbidden",
  404: "not_found",
  409: "conflict",
  410: "gone",
  412: "precondition_failed",
  428: "precondition_required",
  429: "rate_limited"
})[status] ?? (status >= 500 ? "server_error" : "invalid_request");
async function errorFromResponse(res) {
  let body;
  let message = `HTTP ${res.status}`;
  let code = codeForStatus(res.status);
  try {
    const text = await res.text();
    body = text ? JSON.parse(text) : void 0;
    const b = body;
    if (typeof b?.error === "string") message = b.error;
    if (typeof b?.code === "string") code = b.code;
  } catch {
  }
  const ra = res.headers.get("Retry-After");
  return new HttpError(code, message, res.status, body, ra && /^\d+$/.test(ra) ? Number(ra) : void 0);
}
function joinUrl(base, path) {
  return base.replace(/\/+$/, "") + "/" + path.replace(/^\/+/, "");
}
var seg = (s) => encodeURIComponent(s).replace(/%3A/gi, ":");
async function send(http, url, opts = {}) {
  const f = http.fetch ?? globalThis.fetch;
  if (!f) throw new OpenVireoError("network_error", "no fetch implementation available");
  const headers = { ...http.headers, ...opts.headers };
  let body;
  if (opts.json !== void 0) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(opts.json);
  } else if (opts.body) {
    headers["Content-Type"] ??= "application/octet-stream";
    body = opts.body;
  }
  if (opts.token) headers["Authorization"] = `Bearer ${opts.token}`;
  let res;
  try {
    res = await f(url, { method: opts.method ?? "GET", headers, body, signal: opts.signal, redirect: "manual", ...opts.cache ? { cache: opts.cache } : {} });
  } catch (e) {
    if (e?.name === "AbortError") throw new OpenVireoError("aborted", "request aborted", void 0, { cause: e });
    throw new OpenVireoError("network_error", `could not reach ${new URL(url).host}: ${String(e?.message ?? e)}`, 0, { cause: e });
  }
  if (res.type === "opaqueredirect" || res.status >= 300 && res.status < 400 && res.status !== 304) {
    throw new HttpError("invalid_request", "the server answered with a redirect; check the server URL", res.status || 302);
  }
  return res;
}
async function sendJson(http, url, opts = {}) {
  const res = await send(http, url, { ...opts, headers: { Accept: "application/json", ...opts.headers } });
  if (!res.ok) throw await errorFromResponse(res);
  if (res.status === 204) return void 0;
  const text = await res.text();
  return text ? JSON.parse(text) : void 0;
}

// ../sdk/src/auth/client.ts
async function discover(issuer, http = {}) {
  const base = issuer.replace(/\/+$/, "");
  const cfg = await sendJson(http, `${base}/.well-known/openvireo-configuration`);
  for (const k of ["issuer", "api", "sync", "jwks_uri"]) {
    if (typeof cfg?.[k] !== "string") throw new OpenVireoError("invalid_request", `openvireo-configuration is missing "${k}"`);
  }
  if (!cfg.opaque?.ids) throw new OpenVireoError("invalid_request", "openvireo-configuration is missing opaque.ids");
  return cfg;
}
var AuthClient = class _AuthClient {
  constructor(opts) {
    this.opts = opts;
    this.api = opts.api.replace(/\/+$/, "");
  }
  api;
  /** Builds a client from discovery. */
  static async fromIssuer(issuer, opts = {}) {
    const config = await discover(issuer, opts);
    return { config, client: new _AuthClient({ ...opts, api: config.api }) };
  }
  withTokens(tokens) {
    return new _AuthClient({ ...this.opts, tokens });
  }
  url(path, query) {
    let u = joinUrl(this.api, path);
    const q = Object.entries(query ?? {}).filter(([, v]) => v !== void 0);
    if (q.length) u += "?" + q.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join("&");
    return u;
  }
  /** Unauthenticated call */
  pub(method, path, json) {
    return sendJson(this.opts, this.url(path), { method, json });
  }
  /**
   * Authenticated call: retries once with a forced refresh on 401, unless `retry` is false (routes
   * whose 401 means a wrong password and counts towards a lockout).
   */
  async authed(method, path, json, query, retry = true) {
    const tokens = this.opts.tokens;
    if (!tokens) throw new OpenVireoError("signed_out", "this call needs an access token");
    const url = this.url(path, query);
    try {
      return await sendJson(this.opts, url, { method, json, token: await tokens.getAccessToken() });
    } catch (e) {
      if (e.status !== 401 || !retry) throw e;
      return sendJson(this.opts, url, { method, json, token: await tokens.getAccessToken({ force: true }) });
    }
  }
  // ---------------------------------------------------------------- authentication
  registerStart(body) {
    return this.pub("POST", "auth/register/start", body);
  }
  registerFinish(body) {
    return this.pub("POST", "auth/register/finish", body);
  }
  loginStart(body) {
    return this.pub("POST", "auth/login/start", body);
  }
  loginFinish(body) {
    return this.pub("POST", "auth/login/finish", body);
  }
  loginMfa(body) {
    return this.pub("POST", "auth/login/mfa", body);
  }
  refresh(refreshToken) {
    return this.pub("POST", "auth/refresh", { refresh_token: refreshToken });
  }
  logout() {
    return this.authed("POST", "auth/logout");
  }
  serviceAccountExchange(body) {
    return this.pub("POST", "auth/service-account", body);
  }
  // ---------------------------------------------------------------- account recovery (SPEC.md §18)
  /** What an approved reset will do. 409 `recovery_not_ready` (details.notBefore), 410 `recovery_cancelled` / `session_expired`. */
  recoverInfo(token) {
    return this.pub("GET", `auth/recover/${seg(token)}`);
  }
  /** Reset, step 1: an OPAQUE registration request under the account email. */
  recoverStart(body) {
    return this.pub("POST", "auth/recover/start", body);
  }
  /** Reset, step 2: stores the new record, kdf and keyset, archives the old ones and signs this device in. */
  recoverFinish(body) {
    return this.pub("POST", "auth/recover/finish", body);
  }
  // ---------------------------------------------------------------- me, keys, devices
  me() {
    return this.authed("GET", "me");
  }
  passwordStart(body) {
    return this.authed("POST", "me/password/start", body);
  }
  passwordFinish(body) {
    return this.authed("POST", "me/password/finish", body);
  }
  emailRequest(email) {
    return this.authed("POST", "me/email", { email });
  }
  emailStart(body) {
    return this.authed("POST", "me/email/start", body);
  }
  emailFinish(body) {
    return this.authed("POST", "me/email/finish", body);
  }
  /** Whether a recovery archive from a reset exists (SPEC.md §18) */
  recoveryStatus() {
    return this.authed("GET", "me/recovery");
  }
  /** Restore, step 1: OPAQUE login against the archived record. Needs a token issued in the last 5 minutes. */
  restoreStart(body) {
    return this.authed("POST", "me/recovery/restore/start", body);
  }
  /**
   * Restore, step 2: 401 for a wrong old password, else the archived kdf, keyset and grants. Not retried
   * on 401 (a failed verify counts towards the lockout), so call it with a fresh access token.
   */
  restoreVerify(body) {
    return this.authed("POST", "me/recovery/restore/verify", body, void 0, false);
  }
  /** Restore, step 3: the vault keys re-sealed to the current keyset, and the proof. 400 `invalid_proof`. */
  restoreFinish(body) {
    return this.authed("POST", "me/recovery/restore/finish", body, void 0, false);
  }
  /** A one-time code that signs the browser in to the auth website (SPEC.md §16) */
  createWebSession() {
    return this.authed("POST", "me/web-session");
  }
  totpStart() {
    return this.authed("POST", "me/totp");
  }
  totpConfirm(totp) {
    return this.authed("PUT", "me/totp", { totp });
  }
  totpDisable(totp) {
    return this.authed("DELETE", "me/totp", { totp });
  }
  lookupUser(email) {
    return this.authed("GET", "users/lookup", void 0, { email });
  }
  publicKey(principal) {
    return this.authed("GET", `principals/${seg(principal)}/public-key`);
  }
  listDevices() {
    return this.authed("GET", "devices");
  }
  revokeDevice(id) {
    return this.authed("DELETE", `devices/${seg(id)}`);
  }
  // ---------------------------------------------------------------- orgs
  createOrg(name2) {
    return this.authed("POST", "orgs", { name: name2 });
  }
  getOrg(org) {
    return this.authed("GET", `orgs/${seg(org)}`);
  }
  renameOrg(org, name2) {
    return this.authed("PATCH", `orgs/${seg(org)}`, { name: name2 });
  }
  deleteOrg(org) {
    return this.authed("DELETE", `orgs/${seg(org)}`);
  }
  listMembers(org) {
    return this.authed("GET", `orgs/${seg(org)}/members`);
  }
  setMemberRole(org, user, body) {
    return this.authed("PATCH", `orgs/${seg(org)}/members/${seg(user)}`, body);
  }
  removeMember(org, user) {
    return this.authed("DELETE", `orgs/${seg(org)}/members/${seg(user)}`);
  }
  confirmMember(org, user, body) {
    return this.authed("POST", `orgs/${seg(org)}/members/${seg(user)}/confirm`, body);
  }
  listInvitations(org) {
    return this.authed("GET", `orgs/${seg(org)}/invitations`);
  }
  invite(org, body) {
    return this.authed("POST", `orgs/${seg(org)}/invitations`, body);
  }
  cancelInvitation(org, id) {
    return this.authed("DELETE", `orgs/${seg(org)}/invitations/${seg(id)}`);
  }
  acceptInvitation(token) {
    return this.authed("POST", "invitations/accept", { token });
  }
  // ---------------------------------------------------------------- vaults
  listVaults() {
    return this.authed("GET", "vaults");
  }
  createVault(body) {
    return this.authed("POST", "vaults", body);
  }
  getVault(vault) {
    return this.authed("GET", `vaults/${seg(vault)}`);
  }
  renameVault(vault, encryptedName) {
    return this.authed("PATCH", `vaults/${seg(vault)}`, { encrypted_name: encryptedName });
  }
  deleteVault(vault) {
    return this.authed("DELETE", `vaults/${seg(vault)}`);
  }
  listAccess(vault) {
    return this.authed("GET", `vaults/${seg(vault)}/access`);
  }
  grantAccess(vault, grants) {
    return this.authed("POST", `vaults/${seg(vault)}/access`, { grants });
  }
  startRotation(vault, body) {
    return this.authed("POST", `vaults/${seg(vault)}/keys`, body);
  }
  activateKey(vault, version2) {
    return this.authed("POST", `vaults/${seg(vault)}/keys/${version2}/activate`);
  }
  // ---------------------------------------------------------------- service accounts
  listServiceAccounts(org) {
    return this.authed("GET", `orgs/${seg(org)}/service-accounts`);
  }
  createServiceAccount(org, body) {
    return this.authed("POST", `orgs/${seg(org)}/service-accounts`, body);
  }
  getServiceAccount(sa) {
    return this.authed("GET", `service-accounts/${seg(sa)}`);
  }
  updateServiceAccount(sa, body) {
    return this.authed("PATCH", `service-accounts/${seg(sa)}`, body);
  }
  deleteServiceAccount(sa) {
    return this.authed("DELETE", `service-accounts/${seg(sa)}`);
  }
  listSaSecrets(sa) {
    return this.authed("GET", `service-accounts/${seg(sa)}/secrets`);
  }
  issueSaSecret(sa, body) {
    return this.authed("POST", `service-accounts/${seg(sa)}/secrets`, body);
  }
  /** Changes when a secret expires (null: never); the token stays the same (SPEC §9). */
  updateSaSecret(sa, id, body) {
    return this.authed("PATCH", `service-accounts/${seg(sa)}/secrets/${seg(id)}`, body);
  }
  revokeSaSecret(sa, id) {
    return this.authed("DELETE", `service-accounts/${seg(sa)}/secrets/${seg(id)}`);
  }
  // ---------------------------------------------------------------- audit
  audit(org, opts = {}) {
    return this.authed("GET", `orgs/${seg(org)}/audit`, void 0, opts);
  }
};

// ../sdk/src/sync/client.ts
var version = (res) => {
  const rev = Number(res.headers.get("X-Database-Revision"));
  return { etag: res.headers.get("ETag") ?? "", revision: Number.isFinite(rev) ? rev : -1, lastModified: res.headers.get("Last-Modified") ?? void 0 };
};
var BlobHandle = class {
  constructor(client, path) {
    this.client = client;
    this.path = path;
  }
  async head(ifNoneMatch) {
    const res = await this.client.request(this.path, { method: "HEAD", headers: ifNoneMatch ? { "If-None-Match": ifNoneMatch } : {} });
    if (res.status === 404) return { status: 404 };
    if (res.status === 200 || res.status === 304) return { status: res.status, ...version(res) };
    throw await errorFromResponse(res);
  }
  async get(opts = {}) {
    const res = await this.client.request(this.path, { headers: opts.ifNoneMatch ? { "If-None-Match": opts.ifNoneMatch } : {}, signal: opts.signal });
    if (res.status === 404) {
      await res.body?.cancel();
      return { status: 404 };
    }
    if (res.status === 304) return { status: 304, ...version(res) };
    if (res.status !== 200) throw await errorFromResponse(res);
    return { status: 200, data: new Uint8Array(await res.arrayBuffer()), ...version(res) };
  }
  /**
   * Conditional upload: `ifMatch` updates exactly that version; `create` sends `If-None-Match: *`.
   * A mismatch throws an HttpError with code `precondition_failed` (412).
   */
  async put(data2, cond, signal) {
    const headers = "create" in cond ? { "If-None-Match": "*" } : { "If-Match": cond.ifMatch };
    const res = await this.client.request(this.path, { method: "PUT", headers, body: data2, signal });
    if (res.status !== 200 && res.status !== 201) {
      const err = await errorFromResponse(res);
      if (res.status === 412) throw new OpenVireoError("precondition_failed", err.message, 412, { cause: err });
      throw err;
    }
    let meta;
    try {
      meta = await res.json();
    } catch {
    }
    const v = version(res);
    return { created: res.status === 201, etag: v.etag || meta?.etag || "", revision: v.revision >= 0 ? v.revision : meta?.revision ?? -1, lastModified: v.lastModified, meta };
  }
  async delete(ifMatch) {
    const res = await this.client.request(this.path, { method: "DELETE", headers: ifMatch ? { "If-Match": ifMatch } : {} });
    if (res.status !== 204 && res.status !== 200) throw await errorFromResponse(res);
  }
  async history() {
    const res = await this.client.request(`${this.path}/history`, { headers: { Accept: "application/json" } });
    if (!res.ok) throw await errorFromResponse(res);
    return (await res.json()).versions;
  }
  /** One kept version (`<path>/history/<revision>`). */
  async getRevision(revision) {
    const res = await this.client.request(`${this.path}/history/${revision}`);
    if (!res.ok) throw await errorFromResponse(res);
    return { data: new Uint8Array(await res.arrayBuffer()), ...version(res) };
  }
};
var SyncClient = class _SyncClient {
  constructor(opts) {
    this.opts = opts;
    this.baseUrl = opts.baseUrl.replace(/\/+$/, "");
  }
  baseUrl;
  /** For a self-hosted server URL like https://sync.example.org (adds /api/v1, as Qt does). */
  static selfHosted(serverUrl, opts = {}) {
    return new _SyncClient({ ...opts, baseUrl: serverUrl.trim().replace(/\/+$/, "") + "/api/v1" });
  }
  url(path) {
    return joinUrl(this.baseUrl, path);
  }
  async token(force = false) {
    const t = this.opts.token;
    if (!t) return null;
    return typeof t === "string" ? t : t.getAccessToken({ force });
  }
  /** Sends with the bearer token; on 401 with a refreshable source, retries once with a fresh token. */
  async request(path, init = {}) {
    const go = async (force) => send(this.opts, this.url(path), { ...init, token: await this.token(force) });
    const res = await go(false);
    if (res.status === 401 && this.opts.token && typeof this.opts.token !== "string") {
      await res.body?.cancel();
      return go(true);
    }
    return res;
  }
  async json(path, init = {}) {
    const token = await this.token();
    try {
      return await sendJson(this.opts, this.url(path), { ...init, token });
    } catch (e) {
      if (e.status === 401 && this.opts.token && typeof this.opts.token !== "string") {
        return sendJson(this.opts, this.url(path), { ...init, token: await this.token(true) });
      }
      throw e;
    }
  }
  // ---------------------------------------------------------------- JWT routes (sync-openapi.yaml)
  async listVaults() {
    return (await this.json("vaults")).vaults;
  }
  vault(id) {
    return new BlobHandle(this, `vaults/${seg(id)}`);
  }
  // ---------------------------------------------------------------- legacy device-token routes
  async health() {
    return sendJson(this.opts, this.url("health"));
  }
  async listDatabases() {
    return (await this.json("databases")).databases;
  }
  database(id) {
    return new BlobHandle(this, `databases/${seg(id.trim())}`);
  }
  /** A pairing code another device of the same user can claim (needs a device token). */
  async createPairingCode() {
    return this.json("devices/pairing", { method: "POST", json: {} });
  }
  /** Exchanges a pairing code for a device token (no token needed; the code is the credential). */
  async claimPairingCode(code, deviceName) {
    return sendJson(this.opts, this.url("devices/pairing/claim"), { method: "POST", json: { code: code.trim(), deviceName } });
  }
  static isPairingCode(text) {
    return /^[A-Z2-9]{4}[- ]?[A-Z2-9]{4}$/i.test(text.trim());
  }
  /** Same as Qt's SyncServerClient::etagFor: the quoted hex SHA-256 of the data. */
  static async etagFor(data2) {
    const { sha256: sha2564 } = await Promise.resolve().then(() => (init_sha2(), sha2_exports));
    return `"${Array.from(sha2564(data2), (b) => b.toString(16).padStart(2, "0")).join("")}"`;
  }
};

// ../sdk/src/vault/kdbx.ts
var kdbxweb = __toESM(require_kdbxweb(), 1);
var installed = false;
function initKdbx() {
  if (installed) return;
  installed = true;
  kdbxweb.CryptoEngine.setArgon2Impl(async (password, salt, memory, iterations, length, parallelism, type) => {
    const t = type === kdbxweb.CryptoEngine.Argon2TypeArgon2id ? "argon2id" : type === kdbxweb.CryptoEngine.Argon2TypeArgon2d ? "argon2d" : "argon2i";
    const out = await argon2({
      type: t,
      password: new Uint8Array(password),
      salt: new Uint8Array(salt),
      m: memory,
      t: iterations,
      p: parallelism,
      dkLen: length
    });
    return exactBuffer(out);
  });
}
function vaultCredentials(vaultKey) {
  if (vaultKey.length !== 32) throw new OpenVireoError("no_vault_key", "a vault key is 32 bytes");
  const key = new Uint8Array(vaultKey);
  return () => new kdbxweb.Credentials(null, new Uint8Array(key));
}
var VAULT_KDF = { m: 1024 * 1024, t: 2, p: 1 };
var toArrayBuffer = (data2) => data2 instanceof ArrayBuffer ? data2.slice(0) : exactBuffer(data2);
function mapError(e) {
  const code = e?.code;
  if (code === kdbxweb.Consts.ErrorCodes.InvalidKey) {
    throw new OpenVireoError("vault_key_mismatch", "wrong key for this database", void 0, { cause: e });
  }
  throw new OpenVireoError("kdbx_error", `could not read the database: ${e?.message ?? e}`, void 0, { cause: e });
}
async function openKdbx(data2, credentials) {
  initKdbx();
  const creds = typeof credentials === "function" ? credentials() : credentials;
  try {
    return await kdbxweb.Kdbx.load(toArrayBuffer(data2), creds);
  } catch (e) {
    mapError(e);
  }
}
async function saveKdbx(db) {
  initKdbx();
  return new Uint8Array(await db.save());
}
async function openWithKeyVersions(data2, keys) {
  if (keys.length === 0) throw new OpenVireoError("no_vault_key", "no vault key available");
  const sorted = [...keys].sort((a, b) => b.version - a.version);
  let last;
  for (const k of sorted) {
    try {
      return { db: await openKdbx(data2, vaultCredentials(k.key)), keyVersion: k.version };
    } catch (e) {
      if (e.code !== "vault_key_mismatch") throw e;
      last = e;
    }
  }
  throw last;
}
var SYNC_GENERATION_KEY = "KPXC_SYNC_GENERATION";
function syncGeneration(db) {
  const v = db.meta.customData.get(SYNC_GENERATION_KEY)?.value;
  const n = v ? Number.parseInt(v, 10) : 0;
  return Number.isFinite(n) ? n : 0;
}
function setSyncGeneration(db, generation) {
  db.meta.customData.set(SYNC_GENERATION_KEY, { value: String(generation) });
}

// ../sdk/src/merge/fields.ts
init_sha2();
var DEFAULT_ATTRIBUTES = ["Title", "UserName", "Password", "URL", "Notes"];
var isDefaultAttribute = (k) => DEFAULT_ATTRIBUTES.includes(k);
var seconds = (d) => d ? Math.floor(d.getTime() / 1e3) : 0;
var entrySeconds = (e) => seconds(e.times.lastModTime);
function binaryBytes(v) {
  const value = kdbxweb.KdbxBinaries.isKdbxBinaryWithHash(v) ? v.value : v;
  if (value instanceof kdbxweb.ProtectedValue) return { data: value.getBinary(), protectedBinary: true };
  if (value instanceof ArrayBuffer) return { data: new Uint8Array(value), protectedBinary: false };
  if (value instanceof Uint8Array) return { data: value, protectedBinary: false };
  return { data: new Uint8Array(0), protectedBinary: false };
}
function fieldsOf(entry, db) {
  const f = /* @__PURE__ */ new Map();
  for (const [key, value] of entry.fields) {
    const text = value instanceof kdbxweb.ProtectedValue ? value.getText() : String(value ?? "");
    const protect = !isDefaultAttribute(key) && value instanceof kdbxweb.ProtectedValue;
    f.set("attribute/" + key, { kind: "attribute", text, protect, cmp: JSON.stringify([text, protect ? "protected" : ""]) });
  }
  for (const key of DEFAULT_ATTRIBUTES) {
    if (!f.has("attribute/" + key)) f.set("attribute/" + key, { kind: "attribute", text: "", protect: false, cmp: JSON.stringify(["", ""]) });
  }
  for (const [key, value] of entry.binaries) {
    const { data: data2, protectedBinary } = binaryBytes(value);
    f.set("attachment/" + key, { kind: "attachment", data: data2, protectedBinary, cmp: "sha256:" + toHex(sha2562(data2)) });
  }
  const tags = [...entry.tags ?? []];
  f.set("tags", { kind: "tags", tags, cmp: JSON.stringify(tags.join(";")) });
  const at = entry.times.expires && entry.times.expiryTime ? seconds(entry.times.expiryTime) : "never";
  f.set("expiry", { kind: "expiry", at, cmp: JSON.stringify(at) });
  if (entry.customIcon && !entry.customIcon.empty) {
    const id = entry.customIcon.id;
    f.set("icon", { kind: "icon", number: entry.icon ?? 0, custom: { id, icon: db?.meta.customIcons.get(id) }, cmp: "uuid:" + id });
  } else {
    f.set("icon", { kind: "icon", number: entry.icon ?? 0, cmp: "n:" + (entry.icon ?? 0) });
  }
  const fg = entry.fgColor ?? "";
  const bg = entry.bgColor ?? "";
  f.set("colors", { kind: "colors", fg, bg, cmp: JSON.stringify([fg, bg]) });
  return f;
}
var cmpOf = (v) => v === void 0 ? void 0 : v.cmp;
var sameValue = (a, b) => cmpOf(a) === cmpOf(b);
function sameFields(a, b) {
  const fa = fieldsOf(a);
  const fb = fieldsOf(b);
  if (fa.size !== fb.size) return false;
  for (const [k, v] of fa) if (!sameValue(v, fb.get(k))) return false;
  return true;
}
var STANDARD_NAMES = { Title: "Title", UserName: "Username", Password: "Password", URL: "URL", Notes: "Notes" };
function fieldName(field) {
  if (field.startsWith("attribute/")) {
    const k = field.slice("attribute/".length);
    return STANDARD_NAMES[k] ?? k;
  }
  if (field.startsWith("attachment/")) return `attachment ${field.slice("attachment/".length)}`;
  return { tags: "Tags", expiry: "Expiry", icon: "Icon" }[field] ?? "Colors";
}
async function applyField(entry, db, field, value) {
  if (field.startsWith("attribute/")) {
    const key = field.slice("attribute/".length);
    const current = entry.fields.get(key);
    if (!value || value.kind !== "attribute") {
      if (isDefaultAttribute(key)) entry.fields.set(key, current instanceof kdbxweb.ProtectedValue ? kdbxweb.ProtectedValue.fromString("") : "");
      else entry.fields.delete(key);
      return;
    }
    const protect = isDefaultAttribute(key) ? current instanceof kdbxweb.ProtectedValue : value.protect;
    entry.fields.set(key, protect ? kdbxweb.ProtectedValue.fromString(value.text) : value.text);
  } else if (field.startsWith("attachment/")) {
    const key = field.slice("attachment/".length);
    if (!value || value.kind !== "attachment") {
      entry.binaries.delete(key);
      return;
    }
    const bin = value.protectedBinary ? kdbxweb.ProtectedValue.fromBinary(exactBuffer(value.data)) : exactBuffer(value.data);
    entry.binaries.set(key, await db.createBinary(bin));
  } else if (field === "tags") {
    entry.tags = value?.kind === "tags" ? [...value.tags] : [];
  } else if (field === "expiry") {
    const at = value?.kind === "expiry" ? value.at : "never";
    entry.times.expires = at !== "never";
    if (at !== "never") entry.times.expiryTime = new Date(at * 1e3);
  } else if (field === "icon") {
    if (value?.kind !== "icon") return;
    if (value.custom) {
      if (!db.meta.customIcons.has(value.custom.id) && value.custom.icon) db.meta.customIcons.set(value.custom.id, value.custom.icon);
      entry.customIcon = new kdbxweb.KdbxUuid(value.custom.id);
    } else {
      entry.customIcon = void 0;
      entry.icon = value.number;
    }
  } else if (field === "colors") {
    const fg = value?.kind === "colors" ? value.fg : "";
    const bg = value?.kind === "colors" ? value.bg : "";
    entry.fgColor = fg || void 0;
    entry.bgColor = bg || void 0;
  }
}
function resolveFields(local, remote, base, localIsNewer, dbs = {}) {
  const lf = fieldsOf(local, dbs.local);
  const rf = fieldsOf(remote, dbs.remote);
  const bf = fieldsOf(base);
  const keys = [.../* @__PURE__ */ new Set([...lf.keys(), ...rf.keys(), ...bf.keys()])];
  const merged = /* @__PURE__ */ new Map();
  const conflicts = [];
  for (const key of keys) {
    const l = lf.get(key);
    const r = rf.get(key);
    const b = bf.get(key);
    let v;
    if (sameValue(l, r) || sameValue(r, b)) v = l;
    else if (sameValue(l, b)) v = r;
    else {
      v = localIsNewer ? l : r;
      conflicts.push(fieldName(key));
    }
    if (v !== void 0) merged.set(key, v);
  }
  return { merged, conflicts };
}
function conflictingFields(local, remote, base) {
  if (!local || !remote || !base) return [];
  return resolveFields(local, remote, base, true).conflicts;
}

// ../sdk/src/merge/tree.ts
var entryTitle = (e) => {
  const t = e.fields.get("Title");
  return t instanceof kdbxweb.ProtectedValue ? t.getText() : t ?? "";
};
function record(type, item, details) {
  if (item instanceof kdbxweb.KdbxEntry) return { type, uuid: item.uuid.id, title: entryTitle(item), group: item.parentGroup?.name, details };
  if (item) return { type, uuid: item.uuid.id, group: item.name, details };
  return { type, details };
}
function* entriesUnder(group) {
  const stack = [group];
  while (stack.length) {
    const g = stack.pop();
    yield* g.entries;
    for (let i = g.groups.length - 1; i >= 0; i--) stack.push(g.groups[i]);
  }
}
function* groupsUnder(group) {
  for (const child of group.groups) {
    yield child;
    yield* groupsUnder(child);
  }
}
function findEntryByUuid(db, id) {
  for (const e of entriesUnder(db.getDefaultGroup())) if (e.uuid.id === id) return e;
  return void 0;
}
function findGroup(db, id) {
  const root = db.getDefaultGroup();
  if (root.uuid.id === id) return root;
  for (const g of groupsUnder(root)) if (g.uuid.id === id) return g;
  return void 0;
}
function detach(item, list) {
  const parent = item.parentGroup;
  if (!parent) return;
  const siblings = list(parent);
  const i = siblings.indexOf(item);
  if (i >= 0) siblings.splice(i, 1);
  item.parentGroup = void 0;
}
function appendEntry(entry, group) {
  if (entry.parentGroup === group) return;
  detach(entry, (g) => g.entries);
  group.entries.push(entry);
  entry.parentGroup = group;
}
function appendGroup(child, group) {
  if (child.parentGroup === group) return;
  detach(child, (g) => g.groups);
  group.groups.push(child);
  child.parentGroup = group;
}
function removeEntry(entry) {
  detach(entry, (g) => g.entries);
}
function bringIcon(id, from, to) {
  if (!id || !from || from === to || to.meta.customIcons.has(id)) return;
  const icon = from.meta.customIcons.get(id);
  if (icon) to.meta.customIcons.set(id, icon);
}
function overwriteEntryData(dst, src, srcDb, dstDb) {
  dst.copyFrom(src);
  dst.customData = src.customData && new Map([...src.customData].map(([k, item]) => [k, { ...item }]));
  dst.qualityCheck = src.qualityCheck;
  dst.previousParentGroup = src.previousParentGroup;
  if (srcDb === dstDb) return;
  for (const bin of src.binaries.values()) {
    if (kdbxweb.KdbxBinaries.isKdbxBinaryWithHash(bin) && !dstDb.binaries.getValueByHash(bin.hash)) dstDb.binaries.addWithHash(bin);
  }
  bringIcon(src.customIcon?.id, srcDb, dstDb);
}
function copyEntry(src, srcDb, dstDb, kind) {
  const out = new kdbxweb.KdbxEntry();
  overwriteEntryData(out, src, srcDb, dstDb);
  out.parentGroup = void 0;
  out.history = kind === "full" ? src.history.map((h) => copyEntry(h, srcDb, dstDb, "plain")) : [];
  return out;
}
function trimHistory(entry, db) {
  const limit = db.meta.historyMaxItems;
  if (limit === void 0 || limit < 0) return;
  const extra = entry.history.length - limit;
  if (extra > 0) entry.history = entry.history.slice(extra);
}
var customDataKey = (m) => JSON.stringify([...m ?? []].map(([k, item]) => [k, item.value]).sort());
function entryDigest(e) {
  const fields = [...fieldsOf(e)].map(([k, v]) => {
    const raw = k.startsWith("attribute/") ? e.fields.get(k.slice("attribute/".length)) : void 0;
    return [k, v.cmp, raw instanceof kdbxweb.ProtectedValue];
  });
  fields.sort((a, b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0);
  const t = e.times;
  return JSON.stringify([
    e.uuid.id,
    fields,
    [t.lastModTime, t.creationTime, t.lastAccessTime, t.locationChanged].map(seconds),
    t.usageCount ?? 0,
    e.overrideUrl ?? "",
    e.autoType ?? null,
    customDataKey(e.customData),
    e.previousParentGroup?.id ?? ""
  ]);
}
function entriesEqual(a, b) {
  if (entryDigest(a) !== entryDigest(b) || a.history.length !== b.history.length) return false;
  return a.history.every((h, i) => entriesEqual(h, b.history[i]));
}
function mergeHistoryInto(kept, keptDb, other, otherDb) {
  const keptAt = entrySeconds(kept);
  const otherAt = entrySeconds(other);
  const byTime = /* @__PURE__ */ new Map();
  for (const h of kept.history) byTime.set(entrySeconds(h), copyEntry(h, keptDb, keptDb, "plain"));
  for (const h of other.history) {
    const at = entrySeconds(h);
    if (!byTime.has(at) || otherAt > keptAt) byTime.set(at, copyEntry(h, otherDb, keptDb, "plain"));
  }
  if (keptAt < otherAt && !byTime.has(keptAt)) byTime.set(keptAt, copyEntry(kept, keptDb, keptDb, "plain"));
  if (keptAt > otherAt && !byTime.has(otherAt)) byTime.set(otherAt, copyEntry(other, otherDb, keptDb, "plain"));
  const next = [...byTime].sort(([x], [y]) => x - y).map(([, e]) => e);
  const window2 = (keptDb.meta.historyMaxItems ?? 10) - 1;
  const old = kept.history;
  let changed = false;
  for (let back = 1; back <= window2 && !changed; back++) {
    const a = old[old.length - back];
    const b = next[next.length - back];
    changed = a && b ? !entriesEqual(a, b) : a !== b;
  }
  if (!changed) return false;
  kept.history = next;
  trimHistory(kept, keptDb);
  return true;
}
var Pass = class _Pass {
  constructor(from, into) {
    this.from = from;
    this.into = into;
  }
  changes = [];
  /** §1: walks `src` (a group of `from`) into `dst` (its counterpart in `into`). */
  walk(src, dst) {
    for (const entry of [...src.entries]) this.entry(entry, dst);
    for (const child of [...src.groups]) this.walk(child, this.group(child, dst));
  }
  static movedLater(src, dst) {
    return (dst.times.locationChanged?.getTime() ?? 0) < (src.times.locationChanged?.getTime() ?? 0);
  }
  /** §1.1 */
  entry(src, dst) {
    const existing = findEntryByUuid(this.into, src.uuid.id);
    if (!existing) {
      this.changes.push(record("added", src, ""));
      appendEntry(copyEntry(src, this.from, this.into, "full"), dst);
      return;
    }
    if (_Pass.movedLater(src, existing) && existing.parentGroup !== dst) {
      this.changes.push(record("moved", src, `Previous location: ${existing.parentGroup?.name ?? ""}`));
      appendEntry(existing, dst);
    }
    if (entrySeconds(existing) < entrySeconds(src)) {
      const replacement = copyEntry(src, this.from, this.into, "full");
      mergeHistoryInto(replacement, this.into, existing, this.into);
      this.changes.push(record("modified", existing, "Add local modifications to new entry"));
      const home = existing.parentGroup;
      removeEntry(existing);
      appendEntry(replacement, home);
    } else if (mergeHistoryInto(existing, this.into, src, this.from)) {
      this.changes.push(record("modified", existing, "Add new modifications to existing entry"));
    }
  }
  /** §1.2: returns the target group to walk `src`'s contents into. */
  group(src, dst) {
    const existing = findGroup(this.into, src.uuid.id);
    if (!existing) {
      this.changes.push(record("added", src, `Number of entries in group: ${src.entries.length}`));
      const made = new kdbxweb.KdbxGroup();
      made.copyFrom(src);
      made.groups = [];
      made.entries = [];
      made.parentGroup = void 0;
      appendGroup(made, dst);
      made.times.locationChanged = src.times.locationChanged;
      bringIcon(src.customIcon?.id, this.from, this.into);
      return made;
    }
    if (_Pass.movedLater(src, existing) && existing.parentGroup !== dst) {
      this.changes.push(record("moved", src, `Previous location: ${existing.name ?? ""}`));
      appendGroup(existing, dst);
      existing.times.locationChanged = src.times.locationChanged;
    }
    if (seconds(existing.times.lastModTime) < seconds(src.times.lastModTime)) this.updateGroup(src, existing);
    return existing;
  }
  updateGroup(src, dst) {
    const what = [];
    if (dst.name !== src.name) {
      what.push("Group name");
      dst.name = src.name;
    }
    if ((dst.notes ?? "") !== (src.notes ?? "")) {
      what.push("Notes");
      dst.notes = src.notes;
    }
    const custom = src.customIcon && !src.customIcon.empty ? src.customIcon : void 0;
    if (custom) {
      if (dst.customIcon?.id !== custom.id) {
        what.push("Icon (UUID)");
        dst.customIcon = custom;
        bringIcon(custom.id, this.from, this.into);
      }
    } else if (dst.icon !== src.icon || dst.customIcon) {
      what.push("Icon (Number)");
      dst.icon = src.icon;
      dst.customIcon = void 0;
    }
    if (seconds(dst.times.expiryTime) !== seconds(src.times.expiryTime)) {
      what.push("Expiry time");
      dst.times.expiryTime = src.times.expiryTime;
    }
    what.push("Modification time");
    dst.times.lastModTime = src.times.lastModTime;
    this.changes.push(record("modified", src, what.join(", ")));
  }
  /** §4 */
  deletions() {
    const root = this.into.getDefaultGroup();
    const earliest = /* @__PURE__ */ new Map();
    const kept = [];
    const entries = [];
    const groups = [];
    for (const rec of [...this.into.deletedObjects, ...this.from.deletedObjects]) {
      const id = rec.uuid?.id;
      if (!id || !rec.deletionTime) continue;
      const seen = earliest.get(id);
      if (seen) {
        if (seen.deletionTime > rec.deletionTime) earliest.set(id, rec);
        continue;
      }
      earliest.set(id, rec);
      const entry = findEntryByUuid(this.into, id);
      const group = entry ? void 0 : findGroup(this.into, id);
      if (entry) entries.push(entry);
      else if (group && group !== root) groups.push(group);
      else kept.push(rec);
    }
    const deletedAt = (item) => earliest.get(item.uuid.id);
    const editedAfter = (item) => (item.times.lastModTime?.getTime() ?? 0) > deletedAt(item).deletionTime.getTime();
    for (const entry of entries) {
      if (editedAfter(entry)) continue;
      kept.push(deletedAt(entry));
      this.changes.push(record("deleted", entry, "Explicit deletion"));
      removeEntry(entry);
    }
    const waiting = [...groups];
    while (waiting.length) {
      const group = waiting.shift();
      if (group.groups.some((c) => waiting.includes(c))) {
        waiting.push(group);
        continue;
      }
      if (editedAfter(group) || group.entries.length || group.groups.length) continue;
      kept.push(deletedAt(group));
      this.changes.push(record("deleted", group, "Explicit deletion"));
      detach(group, (g) => g.groups);
    }
    const listKey = (l) => l.map((r) => `${r.uuid?.id}@${r.deletionTime?.getTime()}`).join(",");
    if (listKey(kept) !== listKey(this.into.deletedObjects)) {
      this.changes.push(record("metadata", null, "Changed deleted objects"));
      this.into.deletedObjects = kept;
    }
  }
  /** §5 */
  metadata() {
    const src = this.from.meta;
    const dst = this.into.meta;
    for (const [id, icon] of src.customIcons) {
      if (dst.customIcons.has(id)) continue;
      this.changes.push(record("metadata", null, `Adding new icon ${id}`));
      dst.customIcons.set(id, icon);
    }
    const dstTime = customDataTime(dst.customData);
    const srcTime = customDataTime(src.customData);
    const apply = !dst.customData.has("_LAST_MODIFIED") || dstTime !== void 0 && srcTime !== void 0 && dstTime < srcTime;
    if (!apply) return;
    for (const key of [...dst.customData.keys()]) {
      if (src.customData.has(key) || PROTECTED_KEYS.has(key) || key.startsWith("KPXC_BROWSER_")) continue;
      this.changes.push(record("metadata", null, `Removed custom data ${key} [${dst.customData.get(key)?.value ?? ""}]`));
      dst.customData.delete(key);
    }
    for (const [key, item] of src.customData) {
      if (GENERATED_KEYS.has(key) || item.value === dst.customData.get(key)?.value) continue;
      this.changes.push(record("metadata", null, `Adding custom data ${key} [${item.value ?? ""}]`));
      dst.customData.set(key, { ...item });
    }
  }
};
var PROTECTED_KEYS = /* @__PURE__ */ new Set(["_CREATED_", "FDO_SECRETS_EXPOSED_GROUP", "KPXC_REMOTE_SYNC_SETTINGS", "KPXC_SYNC_GENERATION"]);
var GENERATED_KEYS = /* @__PURE__ */ new Set(["_LAST_MODIFIED", "KPXC_RANDOM_SLUG", "KPXC_SYNC_GENERATION"]);
function customDataTime(m) {
  const stamp = Date.parse(m.get("_LAST_MODIFIED")?.value ?? "");
  if (!Number.isNaN(stamp)) return stamp;
  let latest;
  for (const item of m.values()) {
    const t = item.lastModified?.getTime();
    if (t !== void 0 && (latest === void 0 || t > latest)) latest = t;
  }
  return latest;
}
function mergeInto(source, target, mode = "keep-newer") {
  const pass = new Pass(source, target);
  pass.walk(source.getDefaultGroup(), target.getDefaultGroup());
  if (mode === "synchronize") pass.deletions();
  pass.metadata();
  return pass.changes;
}

// ../sdk/src/merge/merger.ts
async function combineEntries(local, localDb, remote, remoteDb, base, now = () => /* @__PURE__ */ new Date()) {
  const localIsNewer = entrySeconds(local) >= entrySeconds(remote);
  const { merged, conflicts } = resolveFields(local, remote, base, localIsNewer, { local: localDb, remote: remoteDb });
  const [newer, newerDb] = localIsNewer ? [local, localDb] : [remote, remoteDb];
  const [older, olderDb] = localIsNewer ? [remote, remoteDb] : [local, localDb];
  const when = new Date(Math.max(seconds(now()), entrySeconds(local), entrySeconds(remote)) * 1e3);
  for (const [entry, db] of [
    [older, olderDb],
    [newer, newerDb]
  ]) {
    const before = copyEntry(entry, db, db, "plain");
    let modified = false;
    if (entry === older) {
      modified = emittingDataDiffers(entry, newer);
      const history = entry.history;
      const parent = entry.parentGroup;
      overwriteEntryData(entry, newer, newerDb, db);
      entry.history = history;
      entry.parentGroup = parent;
    }
    const current = fieldsOf(entry, db);
    for (const key of /* @__PURE__ */ new Set([...current.keys(), ...merged.keys()])) {
      if (!sameValue(current.get(key), merged.get(key))) {
        await applyField(entry, db, key, merged.get(key));
        modified = true;
      }
    }
    entry.times.lastModTime = when;
    if (modified) {
      entry.history.push(before);
      trimHistory(entry, db);
    }
  }
  return conflicts;
}
function emittingDataDiffers(a, b) {
  const pick = (e) => {
    const f = fieldsOf(e);
    const parts = [];
    for (const [k, v] of [...f].sort(([x], [y]) => x < y ? -1 : 1)) {
      if (!k.startsWith("attribute/") && !k.startsWith("attachment/")) continue;
      const prot = k.startsWith("attribute/") && e.fields.get(k.slice(10)) instanceof kdbxweb.ProtectedValue;
      parts.push(`${k}=${v.cmp}${prot ? "/p" : ""}`);
    }
    return parts.join("\n") + "|" + customDataKey(e.customData) + "|" + JSON.stringify(e.autoType);
  };
  return pick(a) !== pick(b);
}
async function mergeDatabases(local, remote, base, opts = {}) {
  const changes = [];
  const conflicts = /* @__PURE__ */ new Map();
  let combined = 0;
  if (base) {
    for (const localEntry of [...entriesUnder(local.getDefaultGroup())]) {
      const remoteEntry = findEntryByUuid(remote, localEntry.uuid.id);
      const baseEntry = findEntryByUuid(base, localEntry.uuid.id);
      if (!remoteEntry || !baseEntry) continue;
      if (sameFields(localEntry, remoteEntry)) continue;
      const localChanged = !sameFields(localEntry, baseEntry);
      const remoteChanged = !sameFields(remoteEntry, baseEntry);
      const lt = entrySeconds(localEntry);
      const rt = entrySeconds(remoteEntry);
      const needed = localChanged && remoteChanged || localChanged && lt <= rt || remoteChanged && rt <= lt;
      if (needed) {
        const c = await combineEntries(localEntry, local, remoteEntry, remote, baseEntry, opts.now);
        if (c.length) conflicts.set(localEntry.uuid.id, c);
        combined++;
        changes.push(record("modified", localEntry, "Combined the changes made on both devices"));
      }
    }
  }
  const mode = opts.mode ?? "keep-newer";
  const toRemote = mergeInto(local, remote, mode);
  const toLocal = mergeInto(remote, local, mode);
  changes.push(...toRemote, ...toLocal);
  if (changes.length) {
    const generation = Math.max(syncGeneration(local), syncGeneration(remote)) + 1;
    setSyncGeneration(local, generation);
    setSyncGeneration(remote, generation);
  }
  return { changes, conflicts, remoteChanged: combined > 0 || toRemote.length > 0, localChanged: combined > 0 || toLocal.length > 0 };
}
function snapshotOf(db) {
  const s = {};
  for (const e of entriesUnder(db.getDefaultGroup())) s[e.uuid.id] = e.times.lastModTime?.getTime() ?? 0;
  return s;
}
function changesSince(local, remote, snapshotMs) {
  const lt = local.times.lastModTime?.getTime() ?? 0;
  const reloaded = lt % 1e3 === 0 && Math.floor(lt / 1e3) === Math.floor(snapshotMs / 1e3);
  const localChanged = lt !== snapshotMs && !reloaded;
  const remoteChanged = entrySeconds(remote) !== Math.floor(snapshotMs / 1e3) || !localChanged && !sameFields(local, remote);
  return { local: localChanged, remote: remoteChanged };
}
function needsCommonBase(local, remote, snapshot) {
  for (const [id, ms] of Object.entries(snapshot)) {
    const l = findEntryByUuid(local, id);
    const r = findEntryByUuid(remote, id);
    if (!l || !r || sameFields(l, r)) continue;
    const c = changesSince(l, r, ms);
    if (c.local && c.remote || c.local && entrySeconds(l) <= entrySeconds(r) || c.remote && entrySeconds(r) <= entrySeconds(l)) return true;
  }
  return false;
}
var deletedIn = (db, id) => db.deletedObjects.some((o) => o.uuid?.id === id);
function findConflicts(local, remote, snapshot) {
  const out = [];
  const changedSince = (e, ms) => entrySeconds(e) !== Math.floor(ms / 1e3);
  for (const [id, ms] of Object.entries(snapshot)) {
    const l = findEntryByUuid(local, id);
    const r = findEntryByUuid(remote, id);
    if (l && r) {
      const c = changesSince(l, r, ms);
      if (!c.local || !c.remote || sameFields(l, r)) continue;
      out.push({ uuid: id, kind: "edited-on-both", title: entryTitle(l), fields: [] });
    } else if (r && deletedIn(local, id) && changedSince(r, ms)) {
      out.push({ uuid: id, kind: "deleted-here-edited-there", title: entryTitle(r), fields: [] });
    } else if (l && deletedIn(remote, id) && changedSince(l, ms)) {
      out.push({ uuid: id, kind: "edited-here-deleted-there", title: entryTitle(l), fields: [] });
    }
  }
  return out;
}

// ../sdk/src/sync/engine.ts
async function openWith(data2, creds) {
  let last;
  for (let i = 0; i < creds.length; i++) {
    try {
      return { db: await openKdbx(data2, creds[i]), index: i };
    } catch (e) {
      if (e.code !== "vault_key_mismatch") throw e;
      last = e;
    }
  }
  throw last ?? new OpenVireoError("vault_key_mismatch", "no credentials to open the server copy");
}
async function syncKdbx(opts) {
  const creds = Array.isArray(opts.credentials) ? opts.credentials : [opts.credentials];
  const prev = opts.acceptServerState ? null : opts.state ?? null;
  const maxAttempts = opts.maxAttempts ?? 5;
  const local = opts.db;
  let changes = [];
  let conflicts = [];
  const finish = (outcome, db, etag, revision, data2, index, attempts, remoteGeneration = 0) => {
    const state = {
      etag,
      revision: Math.max(prev?.revision ?? 0, revision),
      generation: Math.max(prev?.generation ?? 0, remoteGeneration, syncGeneration(db), syncGeneration(local)),
      snapshot: snapshotOf(local),
      base: data2 ?? prev?.base,
      lastSync: (/* @__PURE__ */ new Date()).toISOString()
    };
    return { outcome, db, credentialsIndex: index, data: data2, state, conflicts, changes, attempts };
  };
  const checkRevision = (revision) => {
    if (!opts.acceptServerState && prev && revision >= 0 && revision < prev.revision) {
      throw new OpenVireoError("server_rolled_back", `the sync server returned revision ${revision}, older than revision ${prev.revision} this device already synced`);
    }
  };
  if (prev && opts.localChanged === false && !opts.beforeUpload) {
    opts.onProgress?.("checking");
    const head = await opts.blob.head(prev.etag);
    if (head.status === 304) {
      checkRevision(head.revision);
      return finish("unchanged", local, prev.etag, head.revision, prev.base, -1, 0);
    }
  }
  for (let attempt = 1; ; attempt++) {
    opts.signal?.throwIfAborted();
    opts.onProgress?.("downloading");
    const got = await opts.blob.get({ signal: opts.signal });
    if (got.status === 404) {
      if (!opts.acceptServerState && prev && prev.revision > 0) {
        throw new OpenVireoError("server_lost_database", "the sync server no longer has this database, although this device synced it before");
      }
      await opts.beforeUpload?.(local);
      const data3 = await saveKdbx(local);
      opts.onProgress?.("uploading");
      try {
        const put = await opts.blob.put(data3, { create: true }, opts.signal);
        return finish("created", local, put.etag, put.revision, data3, -1, attempt);
      } catch (e) {
        if (e.code === "precondition_failed" && attempt < maxAttempts) continue;
        throw e;
      }
    }
    if (got.status !== 200) throw new OpenVireoError("server_error", `unexpected status ${got.status}`);
    checkRevision(got.revision);
    opts.onProgress?.("merging");
    const { db: remote, index } = await openWith(got.data, creds);
    const remoteGeneration = syncGeneration(remote);
    if (!opts.acceptServerState && prev && remoteGeneration < prev.generation) {
      throw new OpenVireoError("server_rolled_back", `the server copy has sync generation ${remoteGeneration}, older than ${prev.generation} already synced here`);
    }
    const snapshot = prev?.snapshot ?? {};
    conflicts = findConflicts(local, remote, snapshot);
    let base = null;
    if (prev?.base && (conflicts.some((c) => c.kind === "edited-on-both") || needsCommonBase(local, remote, snapshot))) {
      try {
        base = (await openWith(prev.base, creds)).db;
      } catch {
        base = null;
      }
    }
    if (base) {
      conflicts = conflicts.filter((c) => {
        if (c.kind !== "edited-on-both") return true;
        const b = findEntryByUuid(base, c.uuid);
        if (!b) return true;
        c.fields = conflictingFields(findEntryByUuid(local, c.uuid), findEntryByUuid(remote, c.uuid), b);
        return c.fields.length > 0;
      });
    }
    const merged = await mergeDatabases(local, remote, base, opts.merge);
    changes = merged.changes;
    if (!merged.remoteChanged && !opts.beforeUpload) {
      if (merged.changes.length) {
        setSyncGeneration(local, remoteGeneration);
        setSyncGeneration(remote, remoteGeneration);
      }
      return finish(opts.localChanged === false && !merged.localChanged ? "unchanged" : "pulled", remote, got.etag, got.revision, got.data, index, attempt, remoteGeneration);
    }
    await opts.beforeUpload?.(remote);
    const data2 = await saveKdbx(remote);
    opts.onProgress?.("uploading");
    try {
      const put = await opts.blob.put(data2, { ifMatch: got.etag }, opts.signal);
      return finish("uploaded", remote, put.etag, put.revision, data2, index, attempt, remoteGeneration);
    } catch (e) {
      if (e.code === "precondition_failed") {
        if (attempt < maxAttempts) continue;
        throw new OpenVireoError("too_many_conflicts", "the database on the sync server kept changing during the sync; local changes are kept, sync again", 412, { cause: e });
      }
      throw e;
    }
  }
}

// ../sdk/src/vault/entries.ts
function getUuidString(uuid) {
  if (!uuid) return Math.random().toString(36).substring(2, 11);
  if (typeof uuid === "string") return uuid;
  let bytes = null;
  if (uuid instanceof ArrayBuffer) bytes = new Uint8Array(uuid);
  else if (uuid instanceof Uint8Array) bytes = uuid;
  if (bytes) return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return String(uuid.toString());
}
function fieldText(val) {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (val instanceof kdbxweb.ProtectedValue) return val.getText();
  return String(val);
}

// ../sdk/src/vault/reference.ts
var SCHEME = "ov://";
function parseReference(ref) {
  if (!ref.startsWith(SCHEME)) throw new OpenVireoError("invalid_reference", `not a ov:// reference: ${ref}`);
  const parts = ref.slice(SCHEME.length).split("/").map((p) => {
    try {
      return decodeURIComponent(p);
    } catch {
      throw new OpenVireoError("invalid_reference", `bad percent-encoding in ${ref}`);
    }
  });
  if (parts.length < 3 || parts.some((p) => p === "")) {
    throw new OpenVireoError("invalid_reference", `expected ov://<vault>/<entry>/<field>: ${ref}`);
  }
  return { vault: parts[0], groupPath: parts.slice(1, -2), entry: parts[parts.length - 2], field: parts[parts.length - 1] };
}
var REFERENCE_PATTERN = /ov:\/\/[^\s"'`}]+/g;
var STANDARD = { title: "Title", username: "UserName", user: "UserName", password: "Password", url: "URL", notes: "Notes" };
function uuidMatches(entry, id) {
  const hex = id.replace(/-/g, "").toLowerCase();
  if (/^[0-9a-f]{32}$/.test(hex)) {
    const bytes = new Uint8Array(entry.uuid.toBytes() ?? []);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("") === hex;
  }
  return getUuidString(entry.uuid) === id;
}
function* entriesUnder2(group, recycleBin) {
  if (recycleBin && group.uuid.toString() === recycleBin) return;
  yield* group.entries;
  for (const g of group.groups) yield* entriesUnder2(g, recycleBin);
}
function findEntry(db, ref) {
  let group = db.getDefaultGroup();
  for (const name2 of ref.groupPath) {
    const next = group.groups.find((g) => g.name === name2);
    if (!next) throw new OpenVireoError("entry_not_found", `group "${ref.groupPath.join("/")}" not found`);
    group = next;
  }
  const rb = db.meta.recycleBinUuid?.toString();
  const all = [...entriesUnder2(group, rb)];
  const byId = all.find((e) => uuidMatches(e, ref.entry));
  if (byId) return byId;
  const byTitle = all.filter((e) => fieldText(e.fields.get("Title")) === ref.entry);
  if (byTitle.length === 1) return byTitle[0];
  if (byTitle.length > 1) throw new OpenVireoError("entry_not_found", `${byTitle.length} entries are titled "${ref.entry}"; use the entry UUID`);
  throw new OpenVireoError("entry_not_found", `entry "${ref.entry}" not found`);
}
function resolveFieldName(entry, field) {
  if (entry.fields.has(field)) return field;
  const std = STANDARD[field.toLowerCase()];
  if (std) return std;
  for (const k of entry.fields.keys()) if (k.toLowerCase() === field.toLowerCase()) return k;
  return field;
}
function readField(db, ref) {
  const entry = findEntry(db, ref);
  const name2 = resolveFieldName(entry, ref.field);
  if (!entry.fields.has(name2)) throw new OpenVireoError("entry_not_found", `field "${ref.field}" not found`);
  return fieldText(entry.fields.get(name2));
}
function writeField(db, ref, value, opts = {}) {
  let entry;
  try {
    entry = findEntry(db, ref);
    entry.pushHistory();
  } catch (e) {
    if (!opts.create || e.code !== "entry_not_found" || /\d+ entries/.test(e.message)) throw e;
    let group = db.getDefaultGroup();
    for (const name3 of ref.groupPath) group = group.groups.find((g) => g.name === name3) ?? db.createGroup(group, name3);
    entry = db.createEntry(group);
    entry.fields.set("Title", ref.entry);
  }
  const name2 = resolveFieldName(entry, ref.field);
  const protect = opts.protect ?? (name2 === "Password" || !["Title", "UserName", "URL", "Notes"].includes(name2));
  entry.fields.set(name2, protect ? kdbxweb.ProtectedValue.fromString(value) : value);
  entry.times.update();
  db.cleanup({ historyRules: true });
  return entry;
}

// ../sdk/src/service-account.ts
var ServiceAccount = class _ServiceAccount {
  constructor(saId, config, secret, keyset, access, http) {
    this.saId = saId;
    this.config = config;
    this.secret = secret;
    this.http = http;
    this.keyset = keyset;
    this.access = access;
    const tokens = { getAccessToken: (o) => this.accessToken(o?.force) };
    this.auth = new AuthClient({ ...http, api: config.api, tokens });
    this.sync = new SyncClient({ ...http, baseUrl: config.sync, token: tokens });
  }
  keyset;
  access;
  inflight = null;
  vaults = null;
  opened = /* @__PURE__ */ new Map();
  locks = /* @__PURE__ */ new Map();
  auth;
  sync;
  /** Exchanges the token's secret and unwraps the keyset (token → kek → master → keyset). */
  static async fromToken(token, http = {}) {
    const t = parseSaToken(token);
    const config = http.config ?? await discover(t.url, http);
    const auth = new AuthClient({ ...http, api: config.api });
    const ex = await auth.serviceAccountExchange({ sa_id: t.saId, secret: b64u(t.secret) });
    const master = unwrapSaMaster(t.kek, t.saId, ex.wrapped_master);
    wipe(t.kek);
    try {
      const keyset = unwrapKeyset(master, ex.keyset);
      return new _ServiceAccount(t.saId, config, t.secret, keyset, { token: ex.access_token, expiresAt: Date.now() + ex.expires_in * 1e3 }, http);
    } finally {
      wipe(master);
    }
  }
  get principal() {
    return `sa:${this.saId}`;
  }
  /** SAs have no refresh token: they exchange the secret again when the JWT is about to expire. */
  accessToken(force = false) {
    if (!this.keyset) return Promise.reject(new OpenVireoError("signed_out", "service account closed"));
    if (!force && this.access && this.access.expiresAt - 6e4 > Date.now()) return Promise.resolve(this.access.token);
    this.inflight ??= (async () => {
      const ex = await new AuthClient({ ...this.http, api: this.config.api }).serviceAccountExchange({ sa_id: this.saId, secret: b64u(this.secret) });
      this.access = { token: ex.access_token, expiresAt: Date.now() + ex.expires_in * 1e3 };
      return ex.access_token;
    })().finally(() => this.inflight = null);
    return this.inflight;
  }
  /** Vaults granted to this SA, with names decrypted. */
  async listVaults(refresh = false) {
    if (this.vaults && !refresh) return this.vaults;
    const ks = this.keyset;
    if (!ks) throw new OpenVireoError("signed_out", "service account closed");
    const { vaults } = await this.auth.listVaults();
    this.vaults = vaults.map((v) => {
      const keys = [];
      for (const k of v.keys ?? []) {
        try {
          keys.push({ version: k.key_version, key: unsealVaultKey(ks.encSk, v.id, fromB64u(k.sealed_key)) });
        } catch {
        }
      }
      keys.sort((a, b) => b.version - a.version);
      let name2 = "";
      for (const k of keys) {
        try {
          name2 = decryptVaultName(k.key, v.id, v.encrypted_name);
          break;
        } catch {
        }
      }
      return { id: v.id, name: name2, role: v.role, keys };
    });
    return this.vaults;
  }
  /** Finds a vault by id or (unique) name. */
  async vault(idOrName) {
    const all = await this.listVaults();
    const byId = all.find((v) => v.id === idOrName);
    if (byId) return byId;
    const byName = all.filter((v) => v.name === idOrName);
    if (byName.length === 1) return byName[0];
    throw new OpenVireoError("not_found", byName.length ? `${byName.length} vaults are named "${idOrName}"` : `vault "${idOrName}" not found or not shared with this service account`, 404);
  }
  /** Downloads and opens a vault (cached; `refresh` downloads again). */
  async openVault(idOrName, refresh = false) {
    const v = await this.vault(idOrName);
    const cached = this.opened.get(v.id);
    if (cached && !refresh) return cached.db;
    return this.download(v);
  }
  async download(v) {
    const got = await this.sync.vault(v.id).get();
    if (got.status !== 200) throw new OpenVireoError("not_found", `vault ${v.id} has no data on the sync server`, 404);
    const { db } = await openWithKeyVersions(got.data, v.keys);
    const state = { etag: got.etag, revision: got.revision, generation: syncGeneration(db), snapshot: snapshotOf(db), base: got.data, lastSync: (/* @__PURE__ */ new Date()).toISOString() };
    this.opened.set(v.id, { db, state });
    return db;
  }
  /** Runs `fn` after any other operation on the same vault has finished. */
  serialize(vaultId, fn) {
    const prev = this.locks.get(vaultId) ?? Promise.resolve();
    const run2 = prev.then(fn, fn);
    const tail = run2.catch(() => void 0);
    this.locks.set(vaultId, tail);
    void tail.then(() => this.locks.get(vaultId) === tail && this.locks.delete(vaultId));
    return run2;
  }
  /**
   * Brings the cached copy up to date: a HEAD with the last ETag, and a download only when the server
   * has a newer version (for long-running processes such as `ov connect`). Opens the vault if needed.
   */
  async pull(idOrName) {
    const v = await this.vault(idOrName);
    return this.serialize(v.id, async () => {
      const cached = this.opened.get(v.id);
      if (!cached?.state) return this.download(v);
      const head = await this.sync.vault(v.id).head(cached.state.etag);
      return head.status === 304 ? cached.db : this.download(v);
    });
  }
  /**
   * Changes a vault (needs write): `fn` edits the latest copy, then it is uploaded with the conditional
   * PUT and merge/retry loop. If the upload fails the cached copy is dropped, so a failed edit is never
   * read back. Edits of one vault run one at a time.
   */
  async edit(idOrName, fn) {
    const v = await this.vault(idOrName);
    if (v.role === "read") throw new OpenVireoError("forbidden", `this service account can only read vault "${v.name || v.id}"`, 403);
    return this.serialize(v.id, async () => {
      const db = this.opened.get(v.id)?.db ?? await this.download(v);
      const cached = this.opened.get(v.id);
      try {
        const out = await fn(db);
        const res = await syncKdbx({ blob: this.sync.vault(v.id), db, credentials: v.keys.map((k) => vaultCredentials(k.key)), state: cached.state });
        this.opened.set(v.id, { db: res.db, state: res.state });
        return out;
      } catch (e) {
        this.opened.delete(v.id);
        throw e;
      }
    });
  }
  /** Reads `ov://<vault>/<entry>/<field>`. */
  async read(ref) {
    const r = parseReference(ref);
    return readField(await this.openVault(r.vault), r);
  }
  /** Replaces every ov:// reference in a template (`ov inject` / `run --env-file`). */
  async inject(template) {
    const refs = [...new Set(template.match(REFERENCE_PATTERN) ?? [])];
    const values = /* @__PURE__ */ new Map();
    for (const ref of refs) values.set(ref, await this.read(ref));
    return { text: template.replace(REFERENCE_PATTERN, (m) => values.get(m) ?? m), secrets: [...values.values()] };
  }
  /** Writes a field (needs write) with the conditional PUT and merge/retry loop. */
  async write(ref, value, opts = {}) {
    const r = parseReference(ref);
    await this.edit(r.vault, (db) => void writeField(db, r, value, opts));
  }
  /** Wipes the keyset, vault keys and secret (best effort). */
  close() {
    wipeKeyset(this.keyset);
    this.keyset = null;
    for (const v of this.vaults ?? []) for (const k of v.keys) wipe(k.key);
    this.vaults = null;
    this.opened.clear();
    this.locks.clear();
    wipe(this.secret);
    this.access = null;
  }
};

// ../cli/src/main.ts
import { writeFile } from "fs/promises";
import { readFileSync as readFileSync3 } from "fs";
import { parseArgs as parseArgs2 } from "util";

// ../connect/src/server.ts
import { readFileSync } from "fs";
import { createServer } from "http";
import { createServer as createHttpsServer } from "https";

// ../connect/src/main.ts
import { parseArgs } from "util";
function connectUsage(prog = "openvireo-connect") {
  const col = " ".repeat(prog.length + 15);
  const row = (cmd, what) => `  ${`${prog} ${cmd}`.padEnd(col.length - 2)}${what}
`;
  return "Usage:\n" + row("[serve]", "run the REST server (configured by environment, see README)") + `  ${prog} token [--name N] [--vault V]... [--write]
${col}create a bearer token; prints it and its config entry
` + row("version", "print the version");
}
var CONNECT_USAGE = connectUsage("ov connect");

// ../cli/src/mask.ts
var enc = new TextEncoder();
function maskPatterns(secrets) {
  const set = /* @__PURE__ */ new Set();
  for (const s of secrets) {
    if (!s) continue;
    set.add(s);
    if (/[\r\n]/.test(s)) {
      for (const line of s.split(/\r?\n|\r/)) if (line.trim().length >= 4) set.add(line);
    }
  }
  return [...set];
}

// ../cli/src/run.ts
import { spawn } from "child_process";

// ../cli/src/session.ts
import { readFileSync as readFileSync2 } from "fs";
import { homedir, hostname } from "os";
import { join } from "path";

// ../cli/src/source.ts
function serviceAccountSource(sa) {
  return {
    kind: "service-account",
    principal: sa.principal,
    listVaults: async () => (await sa.listVaults()).map(({ id, name: name2, role }) => ({ id, name: name2, role })),
    open: (v) => sa.openVault(v),
    edit: (v, fn) => sa.edit(v, fn),
    close: () => sa.close()
  };
}

// ../cli/src/session.ts
var VERSION3 = "0.3.0";

// ../cli/src/template.ts
var BRACED_REFERENCE = /\{\{\s*(ov:\/\/[^\s}]+)\s*\}\}/g;
async function readReference(src, ref) {
  const r = parseReference(ref);
  return readField(await src.open(r.vault), r);
}
function findReferences(text) {
  const braced = [...text.matchAll(BRACED_REFERENCE)].map((m) => m[1]);
  const bare = text.replace(BRACED_REFERENCE, "").match(REFERENCE_PATTERN) ?? [];
  return [.../* @__PURE__ */ new Set([...braced, ...bare])];
}
async function resolveTemplate(src, text) {
  const values = /* @__PURE__ */ new Map();
  for (const ref of findReferences(text)) values.set(ref, await readReference(src, ref));
  const out = text.replace(BRACED_REFERENCE, (_, ref) => values.get(ref)).replace(REFERENCE_PATTERN, (m) => values.get(m) ?? m);
  return { text: out, secrets: [...values.values()] };
}

// ../cli/src/main.ts
var USAGE = `ov ${VERSION3}: OpenVireo vault secrets for scripts, CI and servers

Usage:
  ov read <ov://vault/[group/\u2026]entry/field> [-n] [-o file]
  ov inject [-i template] [-o file]          replace ov:// references ({{ ov://\u2026 }} or bare)
  ov run [--env-file .env.tpl]\u2026 [--no-masking] -- <command> [args\u2026]
  ov item get <ov://vault/[group/\u2026]entry> [--reveal] [--json]
  ov item list <vault> [--json]
  ov item create <ov://vault/[group/\u2026]title> [field=value\u2026] [--generate [--length N] [--charset S]] [--stdin-field F]
  ov item edit <ov://vault/[group/\u2026]entry> [field=value\u2026] [--generate [--length N] [--charset S]] [--stdin-field F]
  ov rotate <ov://vault/[group/\u2026]entry/field> (--generate [--length N] [--charset S] | --stdin) [--print]
  ov vault list [--json]
  ov login [--issuer URL] [--email E] [--secret-key K1-\u2026]
  ov logout | ov whoami
  ov connect [serve | token \u2026]               the REST server (see ov connect --help)
  ov version

Credentials: OPENVIREO_SERVICE_ACCOUNT_TOKEN (or OPENVIREO_SERVICE_ACCOUNT_TOKEN_FILE), else the session from
\`ov login\` unlocked with OPENVIREO_PASSWORD or a prompt. Charsets: letters, lower, upper, digits, symbols.
`;

// src/core.ts
import { appendFileSync } from "fs";
import { randomBytes as randomBytes5 } from "crypto";
var escapeData = (s) => s.replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");
function getInput(io, name2) {
  return (io.env[`INPUT_${name2.replace(/ /g, "_").toUpperCase()}`] ?? "").trim();
}
function getBooleanInput(io, name2, fallback) {
  const v = getInput(io, name2).toLowerCase();
  if (!v) return fallback;
  if (["true", "yes", "1"].includes(v)) return true;
  if (["false", "no", "0"].includes(v)) return false;
  throw new Error(`input "${name2}" must be true or false, got "${v}"`);
}
var addMask = (io, value) => io.stdout(`::add-mask::${escapeData(value)}
`);
var info = (io, message) => io.stdout(`${message}
`);
var error = (io, message) => io.stdout(`::error::${escapeData(message)}
`);
function fileCommand(name2, value) {
  let delim;
  do
    delim = `ghadelimiter_${randomBytes5(16).toString("hex")}`;
  while (value.includes(delim) || name2.includes(delim));
  return `${name2}<<${delim}
${value}
${delim}
`;
}
function appendTo(io, file, name2, value) {
  const path = io.env[file];
  if (!path) throw new Error(`${file} is not set: this must run as a GitHub Actions step`);
  appendFileSync(path, fileCommand(name2, value), { encoding: "utf8" });
}
var exportVariable = (io, name2, value) => appendTo(io, "GITHUB_ENV", name2, value);
var setOutput = (io, name2, value) => appendTo(io, "GITHUB_OUTPUT", name2, value);

// src/action.ts
var NAME = /^[A-Za-z_][A-Za-z0-9_]*$/;
var RESERVED = /* @__PURE__ */ new Set(["OPENVIREO_SERVICE_ACCOUNT_TOKEN", "GITHUB_ENV", "GITHUB_OUTPUT", "GITHUB_PATH", "PATH", "NODE_OPTIONS"]);
function collect(io) {
  const out = /* @__PURE__ */ new Map();
  for (const [k, v] of Object.entries(io.env)) {
    if (!v || k.startsWith("INPUT_") || RESERVED.has(k) || !findReferences(v).length) continue;
    out.set(k, v);
  }
  for (const line of getInput(io, "secrets").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    const name2 = i > 0 ? t.slice(0, i).trim() : "";
    if (!NAME.test(name2)) throw new Error(`secrets: expected NAME=ov://\u2026, got "${t}"`);
    if (RESERVED.has(name2)) throw new Error(`secrets: ${name2} can't be set by this action`);
    out.set(name2, t.slice(i + 1).trim());
  }
  return [...out];
}
async function run(io, opts = {}) {
  try {
    const token = getInput(io, "service-account-token") || io.env.OPENVIREO_SERVICE_ACCOUNT_TOKEN?.trim();
    if (!token) throw new Error("no service account token: set the service-account-token input or OPENVIREO_SERVICE_ACCOUNT_TOKEN");
    addMask(io, token);
    const exportEnv = getBooleanInput(io, "export-env", true);
    const wanted = collect(io);
    if (!wanted.length) {
      info(io, "No ov:// references found in the step's env or the secrets input.");
      setOutput(io, "loaded", "");
      return 0;
    }
    const sa = await ServiceAccount.fromToken(token, { fetch: opts.fetch, headers: { "User-Agent": "openvireo-github-action/0.3.0" } });
    const src = serviceAccountSource(sa);
    const resolved = [];
    try {
      for (const [name2, template] of wanted) {
        const { text, secrets } = await resolveTemplate(src, template);
        for (const p of maskPatterns([...secrets, text])) addMask(io, p);
        resolved.push([name2, text]);
      }
    } finally {
      src.close();
    }
    for (const [name2, value] of resolved) {
      if (exportEnv) exportVariable(io, name2, value);
      else setOutput(io, name2, value);
    }
    const names = resolved.map(([n]) => n);
    setOutput(io, "loaded", names.join(","));
    info(io, `Loaded ${names.length} secret${names.length === 1 ? "" : "s"} ${exportEnv ? "into the environment" : "as outputs"}: ${names.join(", ")}`);
    return 0;
  } catch (e) {
    error(io, `openvireo: ${e instanceof Error ? e.message : String(e)}`);
    return 1;
  }
}

// src/index.ts
process.exitCode = await run({ env: process.env, stdout: (s) => process.stdout.write(s) });
/*! Bundled license information:

hash-wasm/dist/index.esm.js:
  (*!
   * hash-wasm (https://www.npmjs.com/package/hash-wasm)
   * (c) Dani Biro
   * @license MIT
   *)

kdbxweb/dist/kdbxweb.js:
  (*! kdbxweb v2.1.1, (c) 2021 Antelle, opensource.org/licenses/MIT *)
  (*!******************!*\
    !*** ./index.ts ***!
    \******************)

@noble/curves/utils.js:
@noble/curves/abstract/modular.js:
@noble/curves/abstract/curve.js:
@noble/curves/abstract/edwards.js:
@noble/curves/abstract/montgomery.js:
@noble/curves/ed25519.js:
  (*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@noble/ciphers/utils.js:
  (*! noble-ciphers - MIT License (c) 2023 Paul Miller (paulmillr.com) *)
*/
