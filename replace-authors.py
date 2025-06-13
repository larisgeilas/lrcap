def replace_author_and_committer(commit):
    if commit.author_name == b"bikebishop":
        commit.author_name = b"Anonymous"
    if commit.author_email == b"bikebishop@example.com":
        commit.author_email = b"anonymous@example.com"
    if commit.committer_name == b"bikebishop":
        commit.committer_name = b"Anonymous"
    if commit.committer_email == b"bikebishop@example.com":
        commit.committer_email = b"anonymous@example.com"

from git_filter_repo import FilterRepo
repo = FilterRepo(callback=replace_author_and_committer)
repo.run()
