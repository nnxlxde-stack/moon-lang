-- Core.Memory — long-term project memory

data LongTerm = LongTerm

memory :: LongTerm -> String -> IO ()
memory _ _ = pure ()

--? Recalls a knowledge key from long-term project memory.
recall :: String -> IO String
recall _ = pure ""