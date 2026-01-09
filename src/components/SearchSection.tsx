import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Stethoscope, Award } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const profissoes = [
  "Médico(a)",
  "Médico(a) Veterinário(a)",
  "Biomédico(a)",
  "Dentista",
  "Fisioterapeuta",
  "Fonoaudiólogo(a)",
  "Quiropraxista",
  "Psicólogo(a)",
  "Psicanalista",
  "Nutricionista",
  "Enfermeiro(a)",
  "Farmacêutico(a)"
];

const SearchSection = () => {
  const [location, setLocation] = useState("");

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
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
              <Input
                placeholder="Cidade ou Bairro"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-10 h-12 bg-background"
              />
            </div>

            <div className="relative">
              <Select>
                <SelectTrigger className="h-12 bg-background">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-muted" />
                    <SelectValue placeholder="Profissão" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {profissoes.map((prof) => (
                    <SelectItem key={prof} value={prof.toLowerCase()}>
                      {prof}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="relative">
              <Select>
                <SelectTrigger className="h-12 bg-background">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-muted" />
                    <SelectValue placeholder="Especialidade" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cardiologia">Cardiologia</SelectItem>
                  <SelectItem value="dermatologia">Dermatologia</SelectItem>
                  <SelectItem value="ortopedia">Ortopedia</SelectItem>
                  <SelectItem value="pediatria">Pediatria</SelectItem>
                  <SelectItem value="neurologia">Neurologia</SelectItem>
                  <SelectItem value="oftalmologia">Oftalmologia</SelectItem>
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
