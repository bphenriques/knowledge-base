;;; build.el --- Minimal emacs installation to build the website -*- lexical-binding: t -*-
;; Authors: Bruno Henriques <4727729+bphenriques@users.noreply.github.com>

;;; Commentary:
;;; - Requires KNOWLEDGE_BASE_DIR environment variable
;;
;; Notes:
;; * This is not a package.
;;; Code:

(require 'subr-x)

(toggle-debug-on-error)                                       ;; Show debug informaton as soon as error occurs.
(setq
 make-backup-files nil                                        ;; Disable "<file>~" backups.
)

(defconst knowledge-base-dir
  (let* ((env-key "KNOWLEDGE_BASE_DIR")
         (env-value (getenv env-key)))
    (if (and env-value (file-directory-p env-value))
        env-value
      (error (format "%s is not set or is not an existing directory (%s)" env-key env-value)))))

;;;
;;; Setup packages using straight.el: https://github.com/raxod502/straight.el
;;;
;;; Leads to better reproducible builds as the versions are pinned.
(defvar bootstrap-version)
(let ((bootstrap-file
       (expand-file-name "straight/repos/straight.el/bootstrap.el" user-emacs-directory))
      (bootstrap-version 5))
  (unless (file-exists-p bootstrap-file)
    (with-current-buffer
        (url-retrieve-synchronously
         "https://raw.githubusercontent.com/raxod502/straight.el/develop/install.el"
         'silent 'inhibit-cookies)
      (goto-char (point-max))
      (eval-print-last-sexp)))
  (load bootstrap-file nil 'nomessage))

(setq straight-use-package-by-default t)
(straight-use-package 'use-package)

;;;
;;; Setup packages
;;;

(use-package ox-hugo
  :straight (:type git :host github :repo "kaushalmodi/ox-hugo"))

(setf org-hugo-base-dir knowledge-base-dir)

;;;
;;; Public functions
;;;

(defun build/export-all ()
  "Export all org-files (including nested) under knowledge-base-org-files."
  (let ((search-path (concat (file-name-as-directory knowledge-base-dir) "org/")))
    (message (format "[build] Looking for files at %s" search-path))
    (dolist (org-file (directory-files-recursively search-path "\.org$"))
      (with-current-buffer (find-file org-file)
			   (message (format "[build] Exporting %s" org-file))
			   (org-hugo-export-wim-to-md :all-subtrees nil nil nil)))
    (message "Done!")))

(provide 'build/export-all)

;;; init.el ends here
