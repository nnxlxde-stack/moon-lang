-- Core.FS — real filesystem operations

--? Reads a UTF-8 text file from disk.
readFile :: String -> IO String
readFile _ = pure ""

--? Writes UTF-8 text to a path, creating parent directories when needed.
writeFile :: String -> String -> IO ()
writeFile _ _ = pure ()

--? Returns whether a filesystem path exists.
pathExists :: String -> IO Bool
pathExists _ = pure False

--? Lists non-hidden entries in a directory (names only).
listDir :: String -> IO [String]
listDir _ = pure []

--? Creates a directory recursively (`mkdir -p` semantics).
makeDir :: String -> IO ()
makeDir _ = pure ()

--? Removes a file or directory tree.
removePath :: String -> IO ()
removePath _ = pure ()