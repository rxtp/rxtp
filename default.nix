{ lib, buildNpmPackage, nodejs, importNpmLock }:

let
  package = builtins.fromJSON (builtins.readFile ./package.json);
in

buildNpmPackage rec {
  pname = package.name;
  version = package.version;

  src = ./.;

  npmConfigHook = importNpmLock.npmConfigHook;
  npmDeps =  importNpmLock {
    npmRoot = src;
  };

  passthru = {
    #
  };

  meta = with lib; {
    homepage = "https://github.com/rxtp/rxtp";
  };
}
