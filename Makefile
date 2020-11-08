SOURCE_ORG_FILES=$(shell pwd)/org
EMACS_BUILD_SRC=$(shell pwd)/tools
EMACS_BUILD_DIR=/tmp/knowledge-base-home-build
BASE_URL=https://bphenriques.github.io/knowledge-base

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
	HOME=$(EMACS_BUILD_DIR) KNOWLEDGE_BASE_ORG_SRC=$(SOURCE_ORG_FILES) emacs -Q --batch --load $(EMACS_BUILD_DIR)/init.el --execute "(build/export-all)" --kill

.PHONY: build-site
build-site:
	hugo --minify --cleanDestinationDir --baseURL $(BASE_URL)

.PHONY: build
build: build-content build-site

