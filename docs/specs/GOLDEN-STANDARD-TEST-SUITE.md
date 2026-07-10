# Golden Standard Test Suite

**Purpose:** Define the all-in-one repository test level that makes an integrated snapshot submittable.

`test / smoke` runs the fast integrated compiler smoke build and milestone smoke tests.

`test / golden-standard` builds the integrated targets and runs milestone, pipeline, parser shadow, security, and soak evidence that represents the complete integration baseline.

## Local Gate Profile

`styio-preview-integrated-snapshot-profile` is the repository-owned adaptation for integrated ecosystem snapshots. It is maintained in this repository through integrated targets, parser shadow evidence, security checks, and soak coverage. The organization-level audit only verifies that this local profile is present and covered by `test / golden-standard`.

Required local markers: repo-owned adaptation, integrated targets, parser shadow, security, soak.

## Industry Gate Group

`ecosystem / integration-quality` is the role-specific gate group for the all-in-one integration snapshot. It keeps integrated compiler targets, pipeline behavior, parser shadow evidence, security checks, and soak coverage grouped under `test / golden-standard`.

Required evidence markers: integrated targets, pipeline, parser shadow, security, soak.

## Submit Readiness

A Styio-Preview snapshot is submittable only when `platform-adaptation / linux-ci-gate`, `test / smoke`, and `test / golden-standard` all pass.
