-- Supabase Schema & RLS Policies for Property Management MVP

-- Create custom types
CREATE TYPE user_role AS ENUM ('landlord', 'tenant', 'admin');
CREATE TYPE verified_status AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE unit_status AS ENUM ('vacant', 'occupied');
CREATE TYPE log_status AS ENUM ('submitted', 'approved', 'rejected');

-- 1. Users Table (Extends auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'tenant',
  verified_status verified_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2. Properties Table
CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES public.users(id) NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL,
  longitude DECIMAL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- 3. Units Table
CREATE TABLE public.units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) NOT NULL,
  unit_name TEXT NOT NULL,
  type TEXT NOT NULL, -- e.g., '1 Bedroom', 'Selfcon'
  status unit_status NOT NULL DEFAULT 'vacant',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;

-- 4. Tenancies Table
CREATE TABLE public.tenancies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID REFERENCES public.units(id) NOT NULL,
  tenant_id UUID REFERENCES public.users(id) NOT NULL,
  rent_amount DECIMAL NOT NULL,
  due_date DATE NOT NULL,
  start_date DATE NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.tenancies ENABLE ROW LEVEL SECURITY;

-- 5. Payments Table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenancy_id UUID REFERENCES public.tenancies(id) NOT NULL,
  amount DECIMAL NOT NULL,
  paid_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 6. Electricity Logs Table
CREATE TABLE public.electricity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID REFERENCES public.units(id) NOT NULL,
  tenant_id UUID REFERENCES public.users(id) NOT NULL,
  amount DECIMAL NOT NULL,
  receipt_url TEXT,
  status log_status NOT NULL DEFAULT 'submitted',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.electricity_logs ENABLE ROW LEVEL SECURITY;

-- 7. Announcements Table
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id), -- If null, applies to all properties
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- 8. Meetings Table
CREATE TABLE public.meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  meeting_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

-- Meeting RSVPs (Bonus for tenant UX)
CREATE TABLE public.meeting_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES public.meetings(id) NOT NULL,
  tenant_id UUID REFERENCES public.users(id) NOT NULL,
  attending BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(meeting_id, tenant_id)
);
ALTER TABLE public.meeting_rsvps ENABLE ROW LEVEL SECURITY;

-- 9. Notifications Table (In-app)
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) NOT NULL,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 10. User Devices (For FCM Push)
CREATE TABLE public.user_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) NOT NULL,
  fcm_token TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, fcm_token)
);
ALTER TABLE public.user_devices ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------
-- RLS POLICIES
-- ----------------------------------------------------

-- Users: Users can read their own profile, landlords can read tenants' profiles in their properties
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);

-- Properties: Landlords can CRUD their own properties. Tenants can view properties they live in.
CREATE POLICY "Landlords can CRUD own properties" ON public.properties 
  FOR ALL USING (auth.uid() = owner_id);
-- (Tenant policy for properties omitted for brevity, usually handled via tenancies join)

-- Units: Landlords can CRUD units in their properties. Tenants can view their own unit.
CREATE POLICY "Landlords can manage units in own properties" ON public.units 
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.properties WHERE id = public.units.property_id AND owner_id = auth.uid()
  ));
CREATE POLICY "Tenants can view own unit" ON public.units 
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.tenancies WHERE unit_id = public.units.id AND tenant_id = auth.uid() AND active = true
  ));

-- Tenancies: 
CREATE POLICY "Landlords manage tenancies" ON public.tenancies 
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.properties p JOIN public.units u ON p.id = u.property_id 
    WHERE u.id = public.tenancies.unit_id AND p.owner_id = auth.uid()
  ));
CREATE POLICY "Tenants view own tenancy" ON public.tenancies 
  FOR SELECT USING (tenant_id = auth.uid());

-- Payments:
CREATE POLICY "Landlords view payments" ON public.payments 
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.tenancies t 
    JOIN public.units u ON t.unit_id = u.id 
    JOIN public.properties p ON u.property_id = p.id 
    WHERE t.id = public.payments.tenancy_id AND p.owner_id = auth.uid()
  ));
CREATE POLICY "Tenants view own payments" ON public.payments 
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.tenancies WHERE id = public.payments.tenancy_id AND tenant_id = auth.uid()
  ));

-- Electricity Logs:
CREATE POLICY "Landlords view electricity logs" ON public.electricity_logs 
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.units u JOIN public.properties p ON u.property_id = p.id 
    WHERE u.id = public.electricity_logs.unit_id AND p.owner_id = auth.uid()
  ));
CREATE POLICY "Tenants CRUD own electricity logs" ON public.electricity_logs 
  FOR ALL USING (tenant_id = auth.uid());

-- Announcements & Meetings:
CREATE POLICY "Landlords manage announcements" ON public.announcements 
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.properties WHERE (id = public.announcements.property_id OR public.announcements.property_id IS NULL) AND owner_id = auth.uid()
  ));
CREATE POLICY "Tenants view announcements" ON public.announcements 
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.tenancies t JOIN public.units u ON t.unit_id = u.id
    WHERE u.property_id = public.announcements.property_id OR public.announcements.property_id IS NULL AND t.tenant_id = auth.uid() AND t.active = true
  ));

-- Database Views & Functions
CREATE OR REPLACE FUNCTION calculate_occupancy(prop_id UUID)
RETURNS TABLE (occupied BIGINT, vacant BIGINT) AS $$
BEGIN
  RETURN QUERY SELECT 
    COUNT(*) FILTER (WHERE status='occupied') AS occupied,
    COUNT(*) FILTER (WHERE status='vacant') AS vacant
  FROM public.units
  WHERE property_id = prop_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE VIEW landlord_dashboard_summary AS
SELECT 
  p.id AS property_id,
  p.owner_id,
  COUNT(u.id) AS total_units,
  COUNT(u.id) FILTER (WHERE u.status = 'occupied') AS occupied_units,
  COUNT(u.id) FILTER (WHERE u.status = 'vacant') AS vacant_units,
  COALESCE(SUM(t.rent_amount) FILTER (WHERE t.active = true), 0) AS expected_rent
FROM public.properties p
LEFT JOIN public.units u ON p.id = u.property_id
LEFT JOIN public.tenancies t ON u.id = t.unit_id AND t.active = true
GROUP BY p.id, p.owner_id;

-- Enable realtime for specified tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.units;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.electricity_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
ALTER PUBLICATION supabase_realtime ADD TABLE public.meetings;
