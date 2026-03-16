from collections import defaultdict


# keep last N message pairs per session (user + assistant = 2 messages per pair)
MAX_MESSAGES = 16


class ConversationMemory:
    def __init__(self):
        self._store: dict[str, list[dict]] = defaultdict(list)

    def add(self, session_id: str, role: str, content: str):
        msgs = self._store[session_id]
        msgs.append({"role": role, "content": content})
        # trim to window size
        if len(msgs) > MAX_MESSAGES:
            self._store[session_id] = msgs[-MAX_MESSAGES:]

    def get(self, session_id: str) -> list[dict]:
        return list(self._store.get(session_id, []))

    def clear(self, session_id: str):
        self._store.pop(session_id, None)

    def session_count(self) -> int:
        return len(self._store)
