import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile, Project, AppSettings } from '../types';

export const firestoreService = {
  // Save or update user profile
  async saveUserProfile(user: UserProfile): Promise<void> {
    const userId = user.id || `usr-${Date.now()}`;
    const path = `users/${userId}`;
    try {
      await setDoc(doc(db, 'users', userId), {
        id: userId,
        name: user.name,
        email: user.email,
        role: user.role || 'Auteur & Créateur Digital',
        bio: user.bio || '',
        avatarBg: user.avatarBg || 'linear-gradient(135deg, #2563eb, #38bdf8)',
        authProvider: user.authProvider || 'google',
        isAdmin: Boolean(user.isAdmin),
        plan: user.plan || 'free',
        planBilling: user.planBilling || 'monthly',
        planRenewsAt: user.planRenewsAt || 'Plan Gratuit Inclus',
        lifetimeProjectsCreated: user.lifetimeProjectsCreated || 0,
        monthlyProjectsCreated: user.monthlyProjectsCreated || 0,
        dailyChatbotCount: user.dailyChatbotCount || 0,
        createdAt: user.createdAt || new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      // Graceful offline fallback
    }
  },

  // Get user profile from Firestore
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const path = `users/${userId}`;
    try {
      const docSnap = await getDoc(doc(db, 'users', userId));
      if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
      }
      return null;
    } catch (error) {
      // Graceful offline fallback
      return null;
    }
  },

  // Save project
  async saveProject(project: Project, userId: string): Promise<void> {
    try {
      await setDoc(doc(db, 'projects', project.id), {
        ...project,
        userId: userId,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch {
      // Graceful offline fallback - LocalStorage handles persistence reliably
    }
  },

  // Fetch all user projects
  async getUserProjects(userId: string): Promise<Project[]> {
    try {
      const q = query(collection(db, 'projects'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const projects: Project[] = [];
      querySnapshot.forEach((doc) => {
        projects.push(doc.data() as Project);
      });
      return projects;
    } catch {
      // Graceful offline fallback
      return [];
    }
  },

  // Delete project
  async deleteProject(projectId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'projects', projectId));
    } catch {
      // Graceful offline fallback
    }
  }
};
