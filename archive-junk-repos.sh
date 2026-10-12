#!/usr/bin/env bash
# One-shot cleanup: archives the 12 dead codename repos from the Aug 14 sandbox burst.
# Archiving is REVERSIBLE (repo Settings -> Unarchive, or rerun with archived=false).
# Run from any machine where `gh auth login` has been done as Vagblasterxl:
#   bash archive-junk-repos.sh
set -u

REPOS=(
  moss-comet-lilac-polar
  polar-yarrow-prism-sunny
  gem-heart-spark-hill
  iris-ember-juniper-zinc
  quartz-ruby-lion-birch
  timber-stone-star-breeze
  atlas-grove-kind-finch
  slate-lotus-beam-pixel
  amber-pepper-cinder-sky
  apex-hazel-rocket-plum
  amber-forge-hill-otter
  palm-cactus-comet-amber
)

for r in "${REPOS[@]}"; do
  echo -n "Archiving Vagblasterxl/$r ... "
  gh api "repos/Vagblasterxl/$r" -X PATCH -F archived=true --jq '.archived' \
    && echo "done" || echo "FAILED (check gh auth / repo name)"
done

echo "All done. To undo any: gh api repos/Vagblasterxl/<name> -X PATCH -F archived=false"
