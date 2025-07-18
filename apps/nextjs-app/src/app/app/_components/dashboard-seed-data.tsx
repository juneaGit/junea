'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { supabase } from '@/config/supabase';
import { useWeddingProfile } from '@/hooks/use-wedding-profile';
import { useUser } from '@/lib/auth';

export const DashboardSeedData = () => {
  const user = useUser();
  const { data: weddingProfile } = useWeddingProfile();
  const [loading, setLoading] = useState(false);

  const seedData = async () => {
    if (!user.data || !weddingProfile) return;

    setLoading(true);
    try {
      // Ajouter des données de budget
      const budgetItems = [
        {
          category: 'Lieu',
          item_name: 'Château de Versailles',
          estimated_cost: 8000,
          actual_cost: 7500,
          is_paid: true,
        },
        {
          category: 'Traiteur',
          item_name: 'Menu gastronomique',
          estimated_cost: 6000,
          actual_cost: 0,
          is_paid: false,
        },
        {
          category: 'Photographie',
          item_name: 'Photographe professionnel',
          estimated_cost: 2000,
          actual_cost: 2000,
          is_paid: true,
        },
        {
          category: 'Musique',
          item_name: 'DJ + Matériel',
          estimated_cost: 1500,
          actual_cost: 0,
          is_paid: false,
        },
        {
          category: 'Fleurs',
          item_name: 'Décoration florale',
          estimated_cost: 1000,
          actual_cost: 800,
          is_paid: true,
        },
        {
          category: 'Robe/Costume',
          item_name: 'Tenues mariés',
          estimated_cost: 2000,
          actual_cost: 1800,
          is_paid: true,
        },
        {
          category: 'Autres',
          item_name: 'Divers',
          estimated_cost: 1000,
          actual_cost: 300,
          is_paid: false,
        },
      ];

      for (const item of budgetItems) {
        await supabase.from('budget_items').insert({
          user_id: user.data.id,
          wedding_profile_id: weddingProfile.id,
          ...item,
        });
      }

      // Ajouter des tâches
      const tasks = [
        {
          title: 'Réserver le lieu',
          due_date: '2024-12-01',
          is_completed: true,
          priority: 'high',
          category: 'venue',
        },
        {
          title: 'Choisir le traiteur',
          due_date: '2024-12-15',
          is_completed: false,
          priority: 'high',
          category: 'catering',
        },
        {
          title: 'Envoyer les invitations',
          due_date: '2025-01-15',
          is_completed: false,
          priority: 'medium',
          category: 'invitations',
        },
        {
          title: 'Essayage robe',
          due_date: '2025-02-01',
          is_completed: false,
          priority: 'medium',
          category: 'dress',
        },
        {
          title: 'Réserver photographe',
          due_date: '2024-11-30',
          is_completed: true,
          priority: 'high',
          category: 'photography',
        },
        {
          title: 'Choisir les alliances',
          due_date: '2025-01-30',
          is_completed: false,
          priority: 'medium',
          category: 'rings',
        },
        {
          title: 'Planifier lune de miel',
          due_date: '2025-03-01',
          is_completed: false,
          priority: 'low',
          category: 'honeymoon',
        },
      ];

      for (const task of tasks) {
        await supabase.from('tasks').insert({
          user_id: user.data.id,
          wedding_profile_id: weddingProfile.id,
          ...task,
        });
      }

      // Ajouter des invités
      const guests = [
        {
          full_name: 'Jean Dupont',
          email: 'jean@example.com',
          rsvp_status: 'confirmed',
          plus_one: true,
        },
        {
          full_name: 'Marie Martin',
          email: 'marie@example.com',
          rsvp_status: 'confirmed',
          plus_one: false,
        },
        {
          full_name: 'Pierre Durand',
          email: 'pierre@example.com',
          rsvp_status: 'pending',
          plus_one: true,
        },
        {
          full_name: 'Sophie Moreau',
          email: 'sophie@example.com',
          rsvp_status: 'confirmed',
          plus_one: false,
        },
        {
          full_name: 'Paul Bernard',
          email: 'paul@example.com',
          rsvp_status: 'declined',
          plus_one: false,
        },
        {
          full_name: 'Claire Petit',
          email: 'claire@example.com',
          rsvp_status: 'confirmed',
          plus_one: true,
        },
        {
          full_name: 'Luc Roux',
          email: 'luc@example.com',
          rsvp_status: 'pending',
          plus_one: false,
        },
      ];

      for (const guest of guests) {
        await supabase.from('guests').insert({
          user_id: user.data.id,
          wedding_profile_id: weddingProfile.id,
          ...guest,
        });
      }

      alert('Données de test ajoutées avec succès !');
      window.location.reload();
    } catch (error) {
      console.error("Erreur lors de l'ajout des données:", error);
      alert("Erreur lors de l'ajout des données");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-6 border-2 border-dashed border-gray-300">
      <CardHeader>
        <CardTitle className="text-gray-600">
          🚀 Données de démonstration
        </CardTitle>
        <CardDescription>
          Ajoutez des données de test pour voir le dashboard en action
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={seedData}
          disabled={loading}
          variant="outline"
          className="w-full"
        >
          {loading ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Ajout en cours...
            </>
          ) : (
            'Ajouter des données de test'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
