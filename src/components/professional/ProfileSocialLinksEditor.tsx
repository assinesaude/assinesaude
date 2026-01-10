import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Instagram, 
  Facebook, 
  Youtube, 
  MessageCircle, 
  Send, 
  MapPin,
  Video,
  Building2,
  FileText
} from 'lucide-react';

interface SocialLinksData {
  bio: string;
  instagram_url: string;
  facebook_url: string;
  tiktok_url: string;
  youtube_url: string;
  kwai_url: string;
  whatsapp_number: string;
  telegram_url: string;
  google_street_view_url: string;
  google_my_business_url: string;
}

interface ProfileSocialLinksEditorProps {
  data: SocialLinksData;
  onChange: (data: SocialLinksData) => void;
}

const ProfileSocialLinksEditor = ({ data, onChange }: ProfileSocialLinksEditorProps) => {
  const handleChange = (field: keyof SocialLinksData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Bio Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="w-5 h-5 text-primary" />
            Sobre Você
          </CardTitle>
          <CardDescription>
            Escreva um breve currículo que será exibido na sua página pública
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={data.bio}
            onChange={(e) => handleChange('bio', e.target.value)}
            placeholder="Conte um pouco sobre sua formação, experiência e especializações..."
            className="min-h-[120px]"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Dica: Um bom currículo inclui sua formação acadêmica, especializações, experiência profissional e diferenciais.
          </p>
        </CardContent>
      </Card>

      {/* Social Media */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Redes Sociais</CardTitle>
          <CardDescription>
            Links opcionais que serão exibidos na sua página pública
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Instagram className="w-4 h-4 text-pink-500" />
                Instagram
              </Label>
              <Input
                value={data.instagram_url}
                onChange={(e) => handleChange('instagram_url', e.target.value)}
                placeholder="https://instagram.com/seuperfil"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Facebook className="w-4 h-4 text-blue-600" />
                Facebook
              </Label>
              <Input
                value={data.facebook_url}
                onChange={(e) => handleChange('facebook_url', e.target.value)}
                placeholder="https://facebook.com/suapagina"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Video className="w-4 h-4" />
                TikTok
              </Label>
              <Input
                value={data.tiktok_url}
                onChange={(e) => handleChange('tiktok_url', e.target.value)}
                placeholder="https://tiktok.com/@seuperfil"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Youtube className="w-4 h-4 text-red-500" />
                YouTube
              </Label>
              <Input
                value={data.youtube_url}
                onChange={(e) => handleChange('youtube_url', e.target.value)}
                placeholder="https://youtube.com/@seucanal"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Video className="w-4 h-4 text-orange-500" />
                Kwai
              </Label>
              <Input
                value={data.kwai_url}
                onChange={(e) => handleChange('kwai_url', e.target.value)}
                placeholder="https://kwai.com/@seuperfil"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-green-500" />
                WhatsApp (número)
              </Label>
              <Input
                value={data.whatsapp_number}
                onChange={(e) => handleChange('whatsapp_number', e.target.value)}
                placeholder="11999999999"
              />
              <p className="text-xs text-muted-foreground">
                Apenas números, com DDD
              </p>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Send className="w-4 h-4 text-blue-400" />
                Telegram
              </Label>
              <Input
                value={data.telegram_url}
                onChange={(e) => handleChange('telegram_url', e.target.value)}
                placeholder="https://t.me/seuperfil"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Google Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="w-5 h-5 text-primary" />
            Presença no Google
          </CardTitle>
          <CardDescription>
            Links para seu estabelecimento no Google Maps e Google Meu Negócio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Google Street View
            </Label>
            <Input
              value={data.google_street_view_url}
              onChange={(e) => handleChange('google_street_view_url', e.target.value)}
              placeholder="Cole aqui o link do Google Street View do seu estabelecimento"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Google Meu Negócio
            </Label>
            <Input
              value={data.google_my_business_url}
              onChange={(e) => handleChange('google_my_business_url', e.target.value)}
              placeholder="Cole aqui o link da sua página no Google Meu Negócio"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSocialLinksEditor;
