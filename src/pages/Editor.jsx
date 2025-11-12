import React, { useEffect, useMemo, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  doc,
  onSnapshot,
  updateDoc,
  getDoc,
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

  const [shareEmail, setShareEmail] = useState("");
  const [shareRole, setShareRole] = useState("viewer");
  const [shareMsg, setShareMsg] = useState("");
  const [role, setRole] = useState("viewer");
  const [user, setUser] = useState(null);

  const skipNextSnapshot = useRef(false); // prevent overwrite after local save

  // ✅ Track logged-in user
  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged((u) => setUser(u));
    return unsubAuth;
  }, []);

  // ✅ Load and subscribe to document updates
  useEffect(() => {
    if (!id) return;
    const docRef = doc(db, "documents", id);

    const loadDoc = async () => {
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        setTitle(data.title || "");
        setContent(data.content || "");

        // Determine role based on permissions
        const currentUser = auth.currentUser;
        const userEmail = currentUser?.email;
        const userRole =
          data.permissions?.[userEmail] ||
          (data.ownerId === currentUser?.uid ? "owner" : "viewer");
        setRole(userRole);
      }
      setLoading(false);
    };

    loadDoc();

    const unsub = onSnapshot(docRef, (snap) => {
      if (!snap.exists()) return;
      if (skipNextSnapshot.current) {
        skipNextSnapshot.current = false;
        return;
      }
      const data = snap.data();
      setTitle((prev) => (data.title !== prev ? data.title : prev));
      setContent((prev) => (data.content !== prev ? data.content : prev));

      const currentUser = auth.currentUser;
      const userEmail = currentUser?.email;
      const userRole =
        data.permissions?.[userEmail] ||
        (data.ownerId === currentUser?.uid ? "owner" : "viewer");
      setRole(userRole);
    });

    return () => unsub();
  }, [id]);

  // ✅ Debounced saving for content (only for editors/owners)
  const saveContent = useMemo(
    () =>
      debounce(async (newContent) => {
        if (role === "viewer") return; // prevent saving for viewers
        try {
          setStatus("Saving...");
          const docRef = doc(db, "documents", id);
          skipNextSnapshot.current = true;
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
    [id, role]
  );

  // ✅ Debounced saving for title (only for editors/owners)
  const saveTitle = useMemo(
    () =>
      debounce(async (newTitle) => {
        if (role === "viewer") return;
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
    [id, role]
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

  // ✅ Share document with permissions (only owner can share)
  const handleShare = async () => {
    if (role !== "owner")
      return setShareMsg("Only the owner can share documents.");
    if (!shareEmail.trim()) return setShareMsg("Please enter an email.");

    try {
      const docRef = doc(db, "documents", id);
      await updateDoc(docRef, {
        [`permissions.${shareEmail.trim()}`]: shareRole,
        updatedAt: Date.now(),
      });
      setShareMsg(`Shared with ${shareEmail} as ${shareRole}`);
      setShareEmail("");
      setShareRole("viewer");
      setTimeout(() => setShareMsg(""), 3000);
    } catch (err) {
      console.error("Error sharing document:", err);
      setShareMsg("Error sharing document");
    }
  };

  if (loading)
    return <div className="text-center mt-5 text-muted">Loading document...</div>;

  return (
    <div className="container-fluid p-3" style={{ height: "90vh" }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <input
            type="text"
            className="form-control form-control-lg"
            value={title}
            onChange={handleTitleChange}
            placeholder="Document title"
            readOnly={role === "viewer"}
          />
          <small className="text-muted">
            {status} | Role: {role.toUpperCase()}
          </small>
        </div>
      </div>

      {role === "owner" && (
        <div className="input-group mb-3" style={{ maxWidth: "500px" }}>
          <input
            type="email"
            className="form-control"
            placeholder="Add collaborator by email"
            value={shareEmail}
            onChange={(e) => setShareEmail(e.target.value)}
          />
          <select
            className="form-select"
            value={shareRole}
            onChange={(e) => setShareRole(e.target.value)}
          >
            <option value="viewer">Viewer</option>
            <option value="editor">Editor</option>
          </select>
          <button className="btn btn-outline-primary" onClick={handleShare}>
            Share
          </button>
        </div>
      )}
      {shareMsg && <small className="text-success">{shareMsg}</small>}

      <textarea
        className="form-control mt-2"
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
        placeholder={
          role === "viewer" ? "View-only mode" : "Start writing..."
        }
        readOnly={role === "viewer"}
      />
    </div>
  );
}
