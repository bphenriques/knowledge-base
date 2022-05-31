{ pkgs }:

with pkgs;
mkShell {
  buildInputs = [hugo];
}
