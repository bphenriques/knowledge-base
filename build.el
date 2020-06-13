;;; build.el --- Minimal emacs installation to export org files using ox-hugo -*- lexical-binding: t -*-
;; Authors: Bruno Henriques <4727729+bphenriques@users.noreply.github.com>

;;; Commentary:
;;
;; Makes available a function '(defun build/export-all (org-folder))' that runs the
;; export tool available in ox-tool to all the files available.
;;
;; Notes:
;; * It disables dir-local-variables due to a ox-hugo issue with (org-hugo-auto-export-mode)
;; * This is not a package.

;;; Usage:
;;
;; Call (build/export-all "<org-folder>". All files including nested will be exported according
;; to the HUGO settings you have defined.

;;; Code:

(require 'package)

(add-to-list 'package-archives '("melpa-stable" . "http://melpa-stable.milkbox.net/packages/") t)
(add-to-list 'package-archives '("melpa" .  "http://melpa.org/packages/") t)

(toggle-debug-on-error)                                       ;; Show debug informaton as soon as error occurs.
(setq
 package-pinned-packages '((ox-hugo . "melpa"))               ;; Pin ox-hugo package to melpa.
 enable-dir-local-variables nil                               ;; Disable due to a bug with (org-hugo-auto-export-mode).
 make-backup-files nil                                        ;; Disable "<file>~" backups.
)

(defvar package-list
  '(ox-hugo)
  "Set of packages to be installed.")

(package-initialize)
(unless package-archive-contents (package-refresh-contents))
(dolist (package package-list)
  (unless (package-installed-p package)
    (package-install package)))

;;;
;;; Available functions to build the project
;;;
(defun build/export-all (org-folder)
  "Export all org-files (including nested) in the provided ORG-FOLDER."
  (dolist (org-file (directory-files-recursively org-folder "\.org$"))
    (find-file org-file)
    (org-hugo-export-wim-to-md :allsubtrees nil nil)))

(provide 'build/export-all)

;;; build.el ends here
