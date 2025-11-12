import React, { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { Link, useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [ownedDocs, setOwnedDocs] = useState([]);
  const [sharedDocs, setSharedDocs] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const navigate = useNavigate();

  // ✅ 1) Persist user session
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setAuthChecked(true);
    });
    return unsubscribe;
  }, []);

  // ✅ 2) Redirect if unauthenticated
  useEffect(() => {
    if (!authChecked) return;
    if (!user) navigate("/login");
  }, [authChecked, user, navigate]);

  // ✅ 3) Real-time document listeners
  useEffect(() => {
    if (!user) return;

    const docsRef = collection(db, "documents");
    const ownedQ = query(docsRef, where("ownerId", "==", user.uid));
    const sharedQ = query(docsRef, where(`permissions.${user.email}`, "!=", null));

    const unsubOwned = onSnapshot(
      ownedQ,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => {
          const ta =
            a.updatedAt?.toDate?.() ??
            new Date(a.updatedAt ?? a.createdAt ?? 0);
          const tb =
            b.updatedAt?.toDate?.() ??
            new Date(b.updatedAt ?? b.createdAt ?? 0);
          return tb - ta;
        });
        setOwnedDocs(list);
        setLoading(false);
      },
      (err) => {
        console.error("Owned docs snapshot error:", err);
        setLoading(false);
      }
    );

    const unsubShared = onSnapshot(
      sharedQ,
      (snap) => {
        const list = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((d) => d.ownerId !== user.uid); // exclude owned
        list.sort((a, b) => {
          const ta =
            a.updatedAt?.toDate?.() ??
            new Date(a.updatedAt ?? a.createdAt ?? 0);
          const tb =
            b.updatedAt?.toDate?.() ??
            new Date(b.updatedAt ?? b.createdAt ?? 0);
          return tb - ta;
        });
        setSharedDocs(list);
        setLoading(false);
      },
      (err) => {
        console.error("Shared docs snapshot error:", err);
        setLoading(false);
      }
    );

    return () => {
      unsubOwned();
      unsubShared();
    };
  }, [user]);

  // ✅ 4) Create document with permissions
  const createDocument = async () => {
    if (!user) return alert("Please log in to create a document");

    const payload = {
      title: title.trim() || "Untitled Document",
      content: "",
      ownerId: user.uid,
      permissions: {
        [user.email]: "owner",
      },
      createdAt: serverTimestamp(),
      updatedAt: Date.now(),
    };

    try {
      const docRef = await addDoc(collection(db, "documents"), payload);
      setOwnedDocs((prev) => [
        { id: docRef.id, ...payload, createdAt: new Date() },
        ...prev,
      ]);
      setTitle("");
    } catch (err) {
      console.error("Error creating document:", err);
      alert("Failed to create document.");
    }
  };

  // ✅ 5) Delete document (only owner)
  const handleDelete = async (id, title) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${title}"?`
    );
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "documents", id));
      setOwnedDocs((prev) => prev.filter((d) => d.id !== id));
      setSharedDocs((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      console.error("Error deleting document:", err);
      alert("Failed to delete document. Please try again.");
    }
  };

  // ✅ 6) Render document list
  const renderDocs = (docs, label) => (
    <>
      <h5 className="mt-4 mb-2 text-uppercase text-secondary fw-bold">
        {label}
      </h5>
      {docs.length === 0 ? (
        <div className="text-muted small ms-2">No documents available.</div>
      ) : (
        <div className="list-group shadow-sm rounded-3 mb-3">
          {docs.map((d) => (
            <div
              key={d.id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <Link
                to={`/editor/${d.id}`}
                className="text-decoration-none flex-grow-1"
              >
                <div className="fw-bold">{d.title || "Untitled"}</div>
                <div className="text-muted small">
                  {d.content
                    ? d.content.slice(0, 60) + "..."
                    : "No content yet"}
                </div>
              </Link>

              <div className="d-flex align-items-center">
                <small className="text-muted me-3">
                  {d.updatedAt?.toDate
                    ? new Date(d.updatedAt.toDate()).toLocaleString()
                    : typeof d.updatedAt === "number"
                    ? new Date(d.updatedAt).toLocaleString()
                    : "No time"}
                </small>
                {d.ownerId === user?.uid && (
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(d.id, d.title)}
                  >
                    🗑
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );

  // ✅ 7) UI
  if (!authChecked)
    return (
      <div className="text-center py-5 text-muted">
        Initializing authentication...
      </div>
    );

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-3">
        <h3 className="mb-3 mb-md-0">Dashboard</h3>
        <div className="d-flex w-100 w-md-auto">
          <input
            className="form-control me-2"
            placeholder="New document title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button className="btn btn-primary" onClick={createDocument}>
            + New
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-muted py-5">Loading documents...</div>
      ) : (
        <>
          {renderDocs(ownedDocs, "My Documents")}
          {renderDocs(sharedDocs, "Shared with Me")}
        </>
      )}
    </div>
  );
}
