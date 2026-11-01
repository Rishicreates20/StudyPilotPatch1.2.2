import test from "node:test";
import assert from "node:assert/strict";
import { buildProfileFromFirebaseUser } from "../lib/user-service";
import { UserProfile } from "../types";

test("buildProfileFromFirebaseUser creates valid profile with admin role for designated admin email", () => {
  const mockFirebaseUser = {
    uid: "test-firebase-uid-123",
    email: "rishikeshsarangi122004@gmail.com",
    displayName: "Rishikesh Sarangi",
    photoURL: "https://example.com/avatar.jpg",
  } as any;

  const profile = buildProfileFromFirebaseUser(mockFirebaseUser);

  assert.equal(profile.id, "test-firebase-uid-123");
  assert.equal(profile.email, "rishikeshsarangi122004@gmail.com");
  assert.equal(profile.display_name, "Rishikesh Sarangi");
  assert.equal(profile.role, "admin");
  assert.equal(profile.photo_url, "https://example.com/avatar.jpg");
  assert.ok(profile.preferences.default_daily_minutes >= 15);
});

test("buildProfileFromFirebaseUser creates standard student profile for regular users", () => {
  const mockStudentUser = {
    uid: "student-uid-456",
    email: "learner@university.edu",
    displayName: "Alex Learner",
    photoURL: null,
  } as any;

  const profile = buildProfileFromFirebaseUser(mockStudentUser);

  assert.equal(profile.id, "student-uid-456");
  assert.equal(profile.email, "learner@university.edu");
  assert.equal(profile.role, "student");
});
