{
  inputs.nixpkgs.url = "github:NixOS/nixpkgs/master";
  inputs.systems.url = "github:nix-systems/default";
  inputs.napalm.url = "github:nix-community/napalm";

  outputs = {
    self,
    nixpkgs,
    flake-utils,
    systems,
    napalm,
  }:
    flake-utils.lib.eachSystem (import systems)
    (system: let
      pkgs = import nixpkgs {inherit system;};
      nodejs = pkgs.nodejs_20;
    in {
      packages.default = napalm.legacyPackages.${system}.buildPackage ./. {
        inherit nodejs;
        npmCommands = [
          "npm ci --ignore-scripts"
          "npx nx run-many --target build"
        ];
        installPhase = ''
          ${pkgs.coreutils}/bin/mv dist/* $out
        '';
      };

      devShells.default = pkgs.mkShell rec {
        buildInputs = [nodejs];
      };
    });
}
