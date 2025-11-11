import React, { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [ownedDocs, setOwnedDocs] = useState([]);
  const [sharedDocs, setSharedDocs] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // ✅ Track auth state for persistence after refresh
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  // ✅ Fetch owned and shared documents separately
  useEffect(() => {
    if (!user) return;

    const ownedQuery = query(
      collection(db, "documents"),
      where("ownerId", "==", user.uid),
      orderBy("updatedAt", "desc")
    );

    const sharedQuery = query(
      collection(db, "documents"),
      where("collaborators", "array-contains", user.email),
      orderBy("updatedAt", "desc")
    );

    const unsubOwned = onSnapshot(ownedQuery, (snap) => {
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setOwnedDocs(docs);
      setLoading(false);
    });

    const unsubShared = onSnapshot(sharedQuery, (snap) => {
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setSharedDocs(docs);
      setLoading(false);
    });

    return () => {
      unsubOwned();
      unsubShared();
    };
  }, [user]);

  // ✅ Create new document owned by user
  const create = async () => {
    try {
      if (!user) return alert("You must be logged in to create a document.");

      const docRef = await addDoc(collection(db, "documents"), {
        title: title.trim() || "Untitled",
        content: "",
        ownerId: auth.currentUser.uid,
        collaborators: [],
        createdAt: serverTimestamp(),
        updatedAt: Date.now(),
      });

      console.log("Created new doc:", docRef.id);
      setTitle("");
    } catch (err) {
      console.error("Error creating document:", err);
    }
  };

  // ✅ Render document list
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
            <Link
              key={d.id}
              to={`/doc/${d.id}`}
              className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
            >
              <div>
                <div className="fw-bold">{d.title || "Untitled"}</div>
                <div className="text-muted small">
                  {d.content ? d.content.slice(0, 60) + "..." : "No content yet"}
                </div>
              </div>
              <small className="text-muted">
                {d.updatedAt
                  ? new Date(d.updatedAt).toLocaleString()
                  : "No time"}
              </small>
            </Link>
          ))}
        </div>
      )}
    </>
  );

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-3">
        <h3 className="mb-3 mb-md-0">Dashboard</h3>
        <div className="d-flex w-100 w-md-auto">
          <input
            className="form-control me-2"
            placeholder="New document title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button className="btn btn-primary" onClick={create}>
            New
          </button>
        </div>
      </div>

      {/* Loading or lists */}
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
