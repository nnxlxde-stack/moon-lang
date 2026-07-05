-- Core.GitHub — GitHub integrations (signature module)

data PullRequest = PullRequest { id :: String }

data ChangedFile = ChangedFile
  { path :: String
  , previousContent :: String
  }

--? Fetches open (non-draft) pull requests for a repository.
--? @param repo GitHub slug, e.g. `org/repo`
fetchOpenPRs :: String -> IO [PullRequest]
fetchOpenPRs _ = pure []

fetchChangedFiles :: PullRequest -> IO [ChangedFile]
fetchChangedFiles _ = pure []

isDraft :: PullRequest -> Bool
isDraft _ = false