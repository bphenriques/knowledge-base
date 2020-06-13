SOURCE_ORG_FILES=$(shell pwd)/org
BUILD_SRC=$(shell pwd)/build.el
BASE_URL=https://bphenriques.github.io/knowledge-base


.PHONY: serve
serve:
	hugo server --minify --disableFastRender

.PHONY: publish
publish:
	$(eval GIT_COMMIT = $(shell git rev-parse --short HEAD))
	git -C add --all
	git -C commit -m "Publish $(GIT_COMMIT)"
	git -C push origin master

.PHONY: build-content
build-content:
	emacs -Q --batch --load=$(BUILD_SRC) --execute "(build/export-all \"$(SOURCE_ORG_FILES)\")" --kill

.PHONY: build-site
build-site:
	hugo --minify --cleanDestinationDir --baseURL $(BASE_URL)

.PHONY: build
build: build-content build-site

