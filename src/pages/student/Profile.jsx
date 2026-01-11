import { useEffect, useState } from "react";
import { useAuth } from "../../authContext";
import { profileApi } from "../../api/profileApi";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import StudentProfile from "../../components/profile/StudentProfile";
import CompanyProfile from "../../components/profile/CompanyProfile";

export default function ProfilePage() {
  const { reloadUser } = useAuth();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await profileApi.get("/api/profile/get");
      setUser({
        uid: data.id,
        email: data.email,
        userType: data.userType,
        status: data.status,
      });
      setProfile(data);
    } catch (err) {
      console.error(err);
      toast.error("Impossible de charger le profil");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-theme-primary h-12 w-12" />
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-4 md:px-8 mt-4 sm:mt-6 pb-24 relative">
      {user?.userType === "student" ? (
        <StudentProfile
          user={user}
          profile={profile}
          setProfile={setProfile}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          reloadUser={reloadUser}
        />
      ) : (
        <CompanyProfile
          user={user}
          profile={profile}
          setProfile={setProfile}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          reloadUser={reloadUser}
        />
      )}
    </div>
  );
}
