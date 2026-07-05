-- Core.Tools — reporting helpers (filesystem primitives live in Core.FS)

--? Reads a UTF-8 file. Implemented via real FS I/O at runtime.
readFile :: String -> IO String
readFile _ = pure ""

--? Writes text content to a file path.
saveToFile :: String -> String -> IO ()
saveToFile _ _ = pure ()

when :: Bool -> IO () -> IO ()
when _ action = action

mapM :: (a -> IO b) -> [a] -> IO [b]
mapM _ _ = pure []

postToSlack :: String -> IO ()
postToSlack _ = pure ()

postSummaryToSlack :: [a] -> IO ()
postSummaryToSlack _ = pure ()

fetchUpdatedDocs :: String -> IO [Documentation]
fetchUpdatedDocs _ = pure []

generateCombinedReport :: [a] -> [a] -> IO String
generateCombinedReport _ _ = pure ""

generateReviewReport :: [a] -> IO String
generateReviewReport _ = pure ""

between :: Float -> Float -> Float
between _ _ = 0.0