{
  inputs.nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";

  outputs = { nixpkgs, ... }:

    let
      platforms = nixpkgs.lib.platforms // { supported = [ "aarch64-linux" "aarch64-darwin" "x86_64-darwin" "x86_64-linux" ]; };
      eachPlatformMerge = op: platforms: f: builtins.foldl' (op f) { } (if !builtins ? currentSystem || builtins.elem builtins.currentSystem platforms then platforms else platforms ++ [ builtins.currentSystem ]);
      eachPlatform = eachPlatformMerge (f: attrs: platform: let ret = f platform; in builtins.foldl' (attrs: key: attrs // { ${key} = (attrs.${key} or { }) // { ${platform} = ret.${key}; }; }) attrs (builtins.attrNames ret));
      eachSupportedPlatform = eachPlatform platforms.supported;
    in

    eachSupportedPlatform (platform:
      let
        pkgs = import nixpkgs {
          system = platform;
          overlays = [
            (final: prev: {
              nodePackages = prev.nodePackages // {
                rxtp = {
                  core = final.callPackage ./packages/core { };
                  platform-node = final.callPackage ./packages/platform-node { };
                };
              };
            })
          ];
        };
      in

      {
        formatter = pkgs.nixpkgs-fmt;
        packages = pkgs;
      });
}
