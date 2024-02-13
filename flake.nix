{
  inputs.nixpkgs.url = "github:NixOS/nixpkgs/master";
  inputs.systems.url = "github:nix-systems/default";

  outputs = {
    self,
    nixpkgs,
    flake-utils,
    systems,
  }:
    flake-utils.lib.eachSystem (import systems)
    (system: let
      pkgs = import nixpkgs {inherit system;};
      node = pkgs.nodejs_20;
      src = ./.;
      package = builtins.fromJSON (builtins.readFile (src + "/package.json"));
      package-lock = builtins.fromJSON (builtins.readFile (src + "/package-lock.json"));

      deps =
        pkgs.lib.attrValues (removeAttrs package-lock.packages [""]);

      tarballs = map (dep:
        pkgs.fetchurl {
          url = dep.resolved;
          hash = dep.integrity;
        })
      deps;

      tarballsFile = pkgs.writeTextFile {
        name = "tarballs";
        text = builtins.concatStringsSep "\n" tarballs;
      };

      cacache =
        pkgs.runCommand "${package.name}-cacache" {
          passAsFile = ["tarballs"];
          tarballs = pkgs.lib.concatLines tarballs;
        }
        ''
          while read -r tarball; do
            echo "caching $tarball" >&2
            ${node}/bin/npm cache add --cache . "$tarball"
          done < "$tarballsPath"
          ${pkgs.coreutils}/bin/cp -r _cacache $out
        '';

      node_modules = pkgs.stdenv.mkDerivation {
        name = "${package.name}-node_modules";
        src = pkgs.runCommand "${package.name}-node-modules-src" {} ''
          mkdir -p $out/.npm
          ln -s ${cacache} $out/.npm/_cacache
          ln -s ${src + "/package-lock.json"} $out/package-lock.json
        '';
        buildInputs = [node];
        outputs = ["out" "dev"];
        buildPhase = ''
          export HOME=$PWD
          npm ci --ignore-scripts
          mv node_modules $dev
          npm ci --ignore-scripts --omit=dev
          mv node_modules $out
          chmod -R +w $out
          chmod -R +w $dev
        '';
      };

      copy_node_modules = pkgs.writeShellApplication rec {
        name = "copy-node_modules";
        runtimeInputs = with pkgs; [node];
        text = ''
          rm -fR node_modules
          cp -r ${node_modules.dev} node_modules
          chmod -R +w node_modules
          export PATH=$PATH:$PWD/node_modules/.bin
        '';
      };
    in {
      packages.default = pkgs.stdenv.mkDerivation {
        inherit (package-lock) name version;
        inherit src;
        buildInputs = [node];
        buildPhase = ''
          export HOME=$PWD/.home
          ln -s ${node_modules.out} node_modules
          export PATH=$PATH:$PWD/node_modules/.bin
          npx nx run-many --target=build
        '';

        installPhase = ''
          mkdir -p $out
          cp -r dist $out
        '';
      };

      devShells.default = pkgs.mkShell rec {
        buildInputs = with pkgs; [node];
        shellHook = ''
          export PATH=$PATH:$PWD/node_modules/.bin
        '';
      };
    });
}
