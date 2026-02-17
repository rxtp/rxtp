{
  lib,
  buildNpmPackage,
  importNpmLock,
  azure-functions-core-tools,
}:

let
  packageJSON = lib.importJSON ./package.json;
in

buildNpmPackage rec {
  pname = packageJSON.name;
  version = packageJSON.version;
  src = lib.sources.cleanSource ./.;
  npmConfigHook = importNpmLock.npmConfigHook;
  npmDeps = importNpmLock {
    npmRoot = src;
  };

  packages = [ azure-functions-core-tools ];
}
