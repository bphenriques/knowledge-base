![](https://github.com/actions/bphenriques/knowledge-base/.github/workflows/main.yml/badge.svg)

# Knowledge Base

My Long-Term memory bank and me learning how to get acquainted with Org-Mode.

# Flow

Edit the files at the `org` folder and export them using [Ox-Hugo](https://ox-hugo.scripter.co/). The generated files will live under `content/docs`.

# Development

The `master` branch contains the latest changes and the branch `gh-pages` contains the published website.

Note: The branch `gh-pages` is configured as a [git worktree](https://git-scm.com/docs/git-worktree) and has its own history using [`git checkout --orphan`](https://git-scm.com/docs/git-checkout/#Documentation/git-checkout.txt---orphanltnewbranchgt).

# Reference

* **Static Page Generator**: [Hugo](https://gohugo.io/)
* **Theme**: [Theme](https://github.com/alex-shpak/hugo-book)
* **Org-Mode Renderer**: [Ox-Hugo](https://ox-hugo.scripter.co/)

Why [Ox-Hugo](https://ox-hugo.scripter.co/)?

Would love to use the built-in [go-org](https://github.com/niklasfasching/go-org) in Hugo, however it does not support display URLs correctly, and the same happens for [Pandoc](https://github.com/jgm/pandoc). For reference:
```
* Link to another file
** [[file:tables-hugo-org.org]]

# Some Section
<<sec:one>>

* Link to to a section...
** [[sec:one]]

* Alternative way to link to a section
** [[Some Section]]
```

# TODO

* Convert this file to `org`
* Figure out a way to decouple a bit from github actions