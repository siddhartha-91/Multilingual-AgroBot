import { auth } from "@/lib/firebase/server-auth";
import { db } from "@/lib/firebase/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function GET(req: Request) {
  try {
    const token = req.headers.get("Authorization")?.split("Bearer ")[1];
    const decoded = await auth.verifyIdToken(token);

    const userDoc = await getDoc(doc(db, "users", decoded.uid));
    const exists = userDoc.exists();

    return Response.json({
      profileCompleted: exists,
    });
  } catch (err) {
    return Response.json({ profileCompleted: false });
  }
}
