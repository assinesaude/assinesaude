import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Search, Stethoscope, Award } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import LocationAutocomplete from "@/components/LocationAutocomplete";

interface Profession {
  id: string;
  name: string;
}

interface Specialty {
  id: string;
  name: string;
  profession_id: string;
}

const SearchSection = () => {
  const [location, setLocation] = useState("");
  const [professions, setProfessions] = useState<Profession[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [selectedProfession, setSelectedProfession] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");

  useEffect(() => {
    fetchProfessions();
    fetchSpecialties();
  }, []);

  const fetchProfessions = async () => {
    const { data } = await supabase
      .from('professions')
      .select('id, name')
      .eq('is_active', true)
      .order('name');
    
    if (data) setProfessions(data);
  };

  const fetchSpecialties = async () => {
    const { data } = await supabase
      .from('specialties')
      .select('id, name, profession_id')
      .eq('is_active', true)
      .order('name');
    
    if (data) setSpecialties(data);
  };

  const filteredSpecialties = selectedProfession
    ? specialties.filter(s => {
        const profession = professions.find(p => p.name.toLowerCase() === selectedProfession);
        return profession && s.profession_id === profession.id;
      })
    : specialties;

  return (
    <section className="relative -mt-24 z-40 px-4">
      <div className="container mx-auto">
        <div className="bg-card rounded-2xl shadow-xl p-6 md:p-8 border border-border">
          <div className="text-center mb-6">
            <h3 className="font-serif text-2xl md:text-3xl font-semibold text-foreground mb-2">
              Encontre seu Profissional
            </h3>
            <p className="text-muted-foreground">
              Busque por especialidade, localização ou nome do profissional
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <LocationAutocomplete
              value={location}
              onChange={(value) => setLocation(value)}
              placeholder="Cidade ou Estado"
            />

            <div className="relative">
              <Select value={selectedProfession} onValueChange={setSelectedProfession}>
                <SelectTrigger className="h-12 bg-background">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-muted-foreground" />
                    <SelectValue placeholder="Profissão" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {professions.map((prof) => (
                    <SelectItem key={prof.id} value={prof.name.toLowerCase()}>
                      {prof.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="relative">
              <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                <SelectTrigger className="h-12 bg-background">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-muted-foreground" />
                    <SelectValue placeholder="Especialidade" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {filteredSpecialties.map((spec) => (
                    <SelectItem key={spec.id} value={spec.name.toLowerCase()}>
                      {spec.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button size="lg" className="h-12 gap-2">
              <Search className="w-5 h-5" />
              Buscar
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SearchSection;
