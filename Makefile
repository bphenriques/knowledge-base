BASE_DIR := $(shell pwd)
EMACS_BUILD_SRC := $(shell pwd)/tools
EMACS_BUILD_DIR := /tmp/knowledge-base-home-build
BASE_URL := https://bphenriques.github.io/knowledge-base

all: clean build-content serve

.PHONY: clean
clean:
	rm -rf content public
	rm -rf static/ox-hugo

.PHONY: serve
serve:
	hugo server --minify --disableFastRender --baseURL localhost:1313

.PHONY: build-content
build-content:
	mkdir -p $(EMACS_BUILD_DIR)
	cp -r $(EMACS_BUILD_SRC)/* $(EMACS_BUILD_DIR)
	# Build temporary minimal EMACS installation separate from the one in the machine.
	HOME=$(EMACS_BUILD_DIR) KNOWLEDGE_BASE_DIR=$(BASE_DIR) emacs -Q --batch --load $(EMACS_BUILD_DIR)/init.el --execute "(build/export-all)" --kill
	# Fixes bad URLs when the baseURL (this case) is not the root URL.
	# There is the option to change the template but I think the solution is too intrusive and it should pass through
	# changing the layout as it is seems to be a bug within HUGO.
	# https://github.com/kaushalmodi/ox-hugo/issues/460
	find $(BASE_DIR)/content -type f -exec sed -i '' -e 's|figure src="/ox-hugo/|figure src="ox-hugo/|g' {} \;

.PHONY: build-site
build-site:
	hugo --minify --cleanDestinationDir --baseURL $(BASE_URL)

.PHONY: build
build: build-content build-site

.PHONY: deploy
deploy: build-content build-site

update-sub-modules:
	git submodule update --init --recursive
	git submodule foreach git pull origin master
