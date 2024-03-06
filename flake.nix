{
  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
  inputs.noxide.url = "github:dominicegginton/noxide";

  outputs = {
    self,
    nixpkgs,
    noxide,
  }: let
    supportedSystems = ["x86_64-linux" "i686-linux" "x86_64-darwin"];

    forAllSystems = f:
      nixpkgs.lib.genAttrs supportedSystems (system: f system);

    nixpkgsFor = forAllSystems (system:
      import nixpkgs {
        inherit system;
        overlays = [
          self.overlays.default
          noxide.overlays.default
        ];
      });

    node = forAllSystems (system: nixpkgsFor.${system}.nodejs_20);
  in {
    formatter = forAllSystems (
      system:
        nixpkgsFor.${system}.alejandra
    );

    overlays = {
      default = final: prev: {
        rxtp = noxide.legacyPackages.${final.system}.buildPackage ./. {
          nodejs = node.${final.system};

          npmCommands = [
            # ignore scripts due to @parcel/watcher postinstall script error
            "npm install --no-audit --no-fund --ignore-scripts"
            "npx nx run-many --target build"
          ];

          installPhase = ''
            mkdir -p $out
            mv dist/packages/* $out
          '';
        };
      };
    };

    packages = forAllSystems (system: {
      inherit (nixpkgsFor.${system}) rxtp;
      default = nixpkgsFor.${system}.rxtp;
    });

    devShells = forAllSystems (system: {
      default = nixpkgsFor.${system}.mkShell {
        buildInputs = with nixpkgsFor.${system}; [node.${system}];
      };
    });
  };
}
