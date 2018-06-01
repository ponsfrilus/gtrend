version := v$(shell node -p "require('./package.json').version")

test :
	@echo $(version)

# generate the man page
man : doc/MAN.md
	@rm -f doc/gtrend.1
	@marked-man	--name 'gTrend' \
				--version $(version) \
				--manual 'GitHub Utilities' \
				doc/MAN.md > doc/gtrend.1
	man doc/gtrend.1


# npm version patch
