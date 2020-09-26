SOURCE_ORG_FILES=$(shell pwd)/org
EMACS_INSTALLATION_SRC=$(shell pwd)/tools/init.el
BUILD_SRC=$(shell pwd)/tools/build.el
BASE_URL=https://bphenriques.github.io/knowledge-base

.PHONY: clean
clean:
	rm -rf content public

.PHONY: serve
serve:
	hugo server --minify --disableFastRender

.PHONY: build-content
build-content:
	# Temporary change the HOME so that the Emacs installation is independent from the one in the machine.
	# Note that given that the packages are not pinned, it may install newer versions.
	HOME=/tmp/knowledge-base-home-build/ emacs -Q --batch --load=$(EMACS_INSTALLATION_SRC) --load=$(BUILD_SRC) --execute "(build/export-all \"$(SOURCE_ORG_FILES)\")" --kill

.PHONY: build-site
build-site:
	hugo --minify --cleanDestinationDir --baseURL $(BASE_URL)

.PHONY: build
build: build-content build-site

