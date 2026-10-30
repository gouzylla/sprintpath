alter table public.exercises
  add column if not exists context text;

update public.exercises
set context = 'commandes (id, client_id, montant, date_commande, pays)' || chr(10) || 'clients (id, nom)'
where domain = 'sql' and (context is null or context = '');
