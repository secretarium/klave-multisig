echo building pkmultisig.wasm from AssemblyScript...
pushd assembly
yarn install
yarn run asbuild
base64 -w 0 .klave/0-pkmultisig.wasm > ../config/wasm/pk_multisig.b64
popd
echo done
