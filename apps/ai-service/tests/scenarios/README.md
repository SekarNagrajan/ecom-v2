# Action scenarios

One YAML per action family. Each case names the action, the arguments, the
user's capabilities and the **expected outcome** — so every action is proven
to handle success, not_found, not_allowed, missing_info, wrong_state and
error rather than only the happy path.

`tests/test_scenarios.py` runs them against the fixture repository;
`evals/run.py --scenarios` scores the same file set against a live service.
