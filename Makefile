SOURCE_ORG_FILES=$(shell pwd)/org

.PHONY: serve
serve:
	hugo server --minify --disableFastRender

.PHONY: publish
publish:
	$(eval GIT_COMMIT = $(shell git rev-parse --short HEAD))
	hugo --minify --baseURL https://bphenriques.github.io/knowledge-base
	git -C public add --all
	git -C public commit -m "Publish $(GIT_COMMIT)"
	git -C public push origin gh-pages


.PHONE: build
build:
	./export-all.sh $(SOURCE_ORG_FILES)
	hugo --minify --cleanDestinationDir --baseURL https://bphenriques.github.io/knowledge-base

