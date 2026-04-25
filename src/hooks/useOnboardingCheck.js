import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

/**
 * Hook que verifica si el usuario necesita completar su onboarding
 * Si no ha completado el perfil, redirige automáticamente a OnboardingProfile
 */
export function useOnboardingCheck() {
  const navigate = useNavigate();
  const location = useLocation();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        // No verificar si ya estamos en onboarding o en login
        if (location.pathname === '/OnboardingProfile') {
          setChecked(true);
          return;
        }

        const user = await base44.auth.me();
        if (!user) {
          setChecked(true);
          return;
        }

        // Buscar si existe un registro de artista vinculado a este usuario
        const artists = await base44.entities.Artist.filter({ user_id: user.id });

        // Si no existe artista registrado, redirigir a onboarding
        if (!artists || artists.length === 0) {
          navigate('/OnboardingProfile', { replace: true });
          return;
        }

        setChecked(true);
      } catch (error) {
        console.error('Error checking onboarding:', error);
        setChecked(true);
      }
    };

    checkOnboarding();
  }, [navigate, location.pathname]);

  return checked;
}