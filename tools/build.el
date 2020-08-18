;;; install.el --- Configures the Emacs installation to export the org-files using ox-hugo and org-roam -*- lexical-binding: t -*-
;; Authors: Bruno Henriques <4727729+bphenriques@users.noreply.github.com>

;;; Commentary:
;;
;; Makes available a function '(defun build/export-all (org-folder))' that runs the
;; export tool available in ox-tool to all the files available.
;;
;; Notes:
;; * This is not a package.

;;; Usage:
;;
;; Call (build/export-all "<org-folder>". All files including nested will be exported according
;; to the HUGO settings you have defined.

;;; Code:

(require 'org-roam)
(require 'subr-x)

(setq
 org-roam-directory (concat (file-name-as-directory (file-name-directory load-file-name)) "../org")
 org-roam-file-exclude-regexp "_index.org"
 org-roam-tag-sources '(prop last-directory))

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
    (insert "Referred in\n")
    (dolist (link links)
      (insert (format "- [[file:%s][%s]]\n"
                      (file-relative-name link org-roam-directory)
                      (org-roam--get-title-or-slug link))))
    (insert "#+end_backlinks\n")))

(add-hook 'org-export-before-processing-hook #'knowledge-base/org-export-preprocessor)

(defun build/export-all (org-folder)
  "Export all org-files (including nested) in the provided ORG-FOLDER."
  (message "Building org-roam db cache...")
  (org-roam-db-build-cache)

  (dolist (org-file (directory-files-recursively org-folder "\.org$"))
    (with-current-buffer (find-file org-file)
      (message (format "[build] Exporting %s" org-file))
      (org-hugo-export-wim-to-md :all-subtrees nil nil nil))))

(provide 'build/export-all)

;;; build.el ends here
