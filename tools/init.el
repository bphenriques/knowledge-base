;;; build.el --- Minimal emacs installation with ox-hugo and org-roam -*- lexical-binding: t -*-
;; Authors: Bruno Henriques <4727729+bphenriques@users.noreply.github.com>

;;; Commentary:
;;; - Requires KNOWLEDGE_BASE_ORG_SOURCE environment variable
;;
;; Notes:
;; * This is not a package.
;;; Code:

(require 'subr-x)

(toggle-debug-on-error)                                       ;; Show debug informaton as soon as error occurs.
(setq
 make-backup-files nil                                        ;; Disable "<file>~" backups.
)

(defconst knowledge-base-org-files
  (let* ((env-key "KNOWLEDGE_BASE_ORG_SRC")
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

(use-package org-roam
  :straight (:type git :host github :repo "org-roam/org-roam")
  :config
  (setq
   org-roam-directory knowledge-base-org-files
   org-roam-file-exclude-regexp "_index.org"
   org-roam-tag-sources '(prop last-directory)))

;;;
;;; Export Helpers
;;;

(defun knowledge-base/org-roam--backlinks-list (file)
  "Return the list of backlinks to the provided FILE."
  (when (org-roam--org-roam-file-p file)
    (mapcar #'car (org-roam-db-query [:select :distinct [from]
                                      :from links
                                      :where (= to $s1)
                                      :and from :not :like $s2] file "%private%"))))

(defun knowledge-base/org-export-preprocessor (_backend)
  "Add a list of backlinks to the to the buffer-file."
  (when-let ((links (knowledge-base/org-roam--backlinks-list (buffer-file-name))))
    (insert "\n#+begin_backlinks\n")
    (insert "Referred in:\n")
    (dolist (link links)
      (insert (format "- [[file:%s][%s]]\n"
                      (file-relative-name link org-roam-directory)
                      (org-roam--get-title-or-slug link))))
    (insert "#+end_backlinks\n")))

(add-hook 'org-export-before-processing-hook #'knowledge-base/org-export-preprocessor)

;;;
;;; Public functions
;;;

(defun build/export-all ()
  "Export all org-files (including nested) under knowledge-base-org-files."
  (message "Building org-roam db cache...")
  (org-roam-db-build-cache)

  (dolist (org-file (directory-files-recursively knowledge-base-org-files "\.org$"))
    (with-current-buffer (find-file org-file)
      (message (format "[build] Exporting %s" org-file))
      (org-hugo-export-wim-to-md :all-subtrees nil nil nil)))

  (message "Done!"))

(provide 'build/export-all)

;;; init.el ends here
