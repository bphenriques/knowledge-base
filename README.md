![Deploy Github Pages on gh-pages](https://github.com/bphenriques/knowledge-base/workflows/Deploy%20Github%20Pages%20on%20gh-pages/badge.svg)

# Knowledge Base

My Long-Term memory bank and me learning how to get acquainted with Org-Mode.

# How to use

Edit the files as you will under the `org` folder following [Ox-Hugo](https://ox-hugo.scripter.co/) guidelines. The Github Action will export the content to markdown.

# Locally

1. `make build-content serve`
2. Edit the files in Emacs and save. The content should be reflected in the website.

# Development

The `master` branch contains the latest changes and the branch `gh-pages` contains the published website.

Note: The branch `gh-pages` is configured as [git worktree](https://git-scm.com/docs/git-worktree) and has its own history using [`git checkout --orphan`](https://git-scm.com/docs/git-checkout/#Documentation/git-checkout.txt---orphanltnewbranchgt).

# Reference

* **Static Page Generator**: [Hugo](https://gohugo.io/)
* **Theme**: [Theme](https://github.com/alex-shpak/hugo-book)
* **Org-Mode Renderer**: [Ox-Hugo](https://ox-hugo.scripter.co/)

Also, inspired by:
* https://github.com/jethrokuan/braindump
* https://wiki.nikitavoloboev.xyz/

# TODO

* Convert this file to `org`
* Figure out a way to decouple a bit from github actions.
