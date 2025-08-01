{ lib, buildNpmPackage, importNpmLock, nodePackages }:

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
}
