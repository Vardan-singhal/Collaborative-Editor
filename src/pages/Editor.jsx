import React, { useEffect, useMemo, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  doc,
  onSnapshot,
  updateDoc,
  getDoc,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { debounce } from "../utils/debounce";

export default function Editor() {
  const { id } = useParams();
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const [collabEmail, setCollabEmail] = useState("");
  const [shareMsg, setShareMsg] = useState("");
  const [user, setUser] = useState(null);

  const skipNextSnapshot = useRef(false); // ✅ prevent overwrite after local save

  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged((u) => setUser(u));
    return unsubAuth;
  }, []);

  useEffect(() => {
    if (!id) return;
    const docRef = doc(db, "documents", id);

    // Load once
    getDoc(docRef)
      .then((snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setTitle(data.title || "");
          setContent(data.content || "");
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    // Real-time listener
    const unsub = onSnapshot(docRef, (snap) => {
      if (!snap.exists()) return;
      if (skipNextSnapshot.current) {
        skipNextSnapshot.current = false;
        return; // ✅ skip the immediate echo of our own update
      }
      const data = snap.data();
      setTitle((prev) => (data.title !== prev ? data.title : prev));
      setContent((prev) => (data.content !== prev ? data.content : prev));
    });

    return () => unsub();
  }, [id]);

  // ✅ Debounced saving for content
  const saveContent = useMemo(
    () =>
      debounce(async (newContent) => {
        try {
          setStatus("Saving...");
          const docRef = doc(db, "documents", id);
          skipNextSnapshot.current = true; // ✅ prevent overwrite
          await updateDoc(docRef, {
            content: newContent,
            updatedAt: serverTimestamp(),
          });
          setStatus("Saved");
          setTimeout(() => setStatus(""), 800);
        } catch (error) {
          console.error("Error saving content:", error);
          setStatus("Error saving");
        }
      }, 600),
    [id]
  );

  // ✅ Debounced saving for title
  const saveTitle = useMemo(
    () =>
      debounce(async (newTitle) => {
        try {
          const docRef = doc(db, "documents", id);
          skipNextSnapshot.current = true;
          await updateDoc(docRef, {
            title: newTitle,
            updatedAt: serverTimestamp(),
          });
        } catch (error) {
          console.error("Error saving title:", error);
        }
      }, 800),
    [id]
  );

  const handleContentChange = (e) => {
    const value = e.target.value;
    setContent(value);
    saveContent(value);
  };

  const handleTitleChange = (e) => {
    const value = e.target.value;
    setTitle(value);
    saveTitle(value);
  };

  const handleAddCollaborator = async () => {
    try {
      const email = collabEmail.trim();
      if (!email) return setShareMsg("Please enter an email");

      const docRef = doc(db, "documents", id);
      await updateDoc(docRef, {
        collaborators: arrayUnion(email),
        updatedAt: serverTimestamp(),
      });

      setShareMsg(`Document shared with ${email}`);
      setCollabEmail("");
      setTimeout(() => setShareMsg(""), 3000);
    } catch (err) {
      console.error("Error sharing document:", err);
      setShareMsg("Error sharing document");
    }
  };

  if (loading) return <div className="text-center mt-5">Loading document...</div>;

  return (
    <div className="container-fluid p-3" style={{ height: "90vh" }}>
      <div className="mb-3">
        <input
          type="text"
          className="form-control form-control-lg"
          value={title}
          onChange={handleTitleChange}
          placeholder="Document title"
        />
        <small className="text-muted">{status}</small>
      </div>

      <div className="input-group mb-3" style={{ maxWidth: "400px" }}>
        <input
          type="email"
          className="form-control"
          placeholder="Add collaborator by email"
          value={collabEmail}
          onChange={(e) => setCollabEmail(e.target.value)}
        />
        <button className="btn btn-outline-primary" onClick={handleAddCollaborator}>
          Share
        </button>
      </div>
      {shareMsg && <small className="text-success">{shareMsg}</small>}

      <textarea
        className="form-control"
        style={{
          height: "70vh",
          resize: "none",
          fontFamily:
            'ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", monospace',
          fontSize: "16px",
          lineHeight: "1.6",
        }}
        value={content}
        onChange={handleContentChange}
        placeholder="Start writing..."
      />
    </div>
  );
}
