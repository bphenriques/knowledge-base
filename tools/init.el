;;; build.el --- Minimal emacs installation with ox-hugo and org-roam -*- lexical-binding: t -*-
;; Authors: Bruno Henriques <4727729+bphenriques@users.noreply.github.com>

;;; Commentary:
;;
;; Notes:
;; * This is not a package.
;;; Code:

(require 'package)

(add-to-list 'package-archives '("melpa" . "https://melpa.org/packages/") t)

(toggle-debug-on-error)                                       ;; Show debug informaton as soon as error occurs.
(setq
 make-backup-files nil                                        ;; Disable "<file>~" backups.
)

(defvar package-list
  '(ox-hugo
    org-roam)
  "Set of packages to be installed.")

(package-initialize)
(unless package-archive-contents (package-refresh-contents))
(dolist (package package-list)
  (unless (package-installed-p package)
    (package-install package)))

;;; init.el ends here
