;;; Setup Emacs Environment
(require 'package)

(add-to-list 'package-archives
             '("melpa-stable" . "http://melpa-stable.milkbox.net/packages/") t)

(setq package-list '(ox-hugo))
(package-initialize)

(unless package-archive-contents (package-refresh-contents))

(dolist (package package-list)
  (unless (package-installed-p package)
    (package-install package)))

;;; Enable Debug
(setq debug-ignored-errors (remq 'user-error debug-ignored-errors))
(toggle-debug-on-error)

(defun build/export-all ()
  "Invokes ox-hugo export all-subtrees given the current buffer"
  (org-hugo-export-wim-to-md :all-subtrees nil nil))
