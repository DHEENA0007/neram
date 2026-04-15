import { 
  LucideLayoutDashboard, LucideUsers, LucideList, LucideSettings, 
  LucideCalendar, LucideArrowRight, LucideLogOut, LucideSun, 
  LucideUserPlus, LucideCheck, LucideMapPin, LucideShield, 
  LucideBan, LucideCheckCircle, LucideCpu, LucideDownload, 
  LucideTrash2, LucideInfo, LucideBird, LucideSearch
} from 'lucide-react';
import { GiVulture, GiOwl, GiCrowDive, GiRooster, GiFeather } from "react-icons/gi";

export function IconDashboard({ size = 16 }) { return <LucideLayoutDashboard size={size} />; }
export function IconUsers({ size = 16 }) { return <LucideUsers size={size} />; }
export function IconList({ size = 16 }) { return <LucideList size={size} />; }
export function IconSettings({ size = 16 }) { return <LucideSettings size={size} />; }
export function IconCalendar({ size = 16 }) { return <LucideCalendar size={size} />; }
export function IconArrowRight({ size = 16, className }) { return <LucideArrowRight size={size} className={className} />; }
export function IconLogout({ size = 16 }) { return <LucideLogOut size={size} />; }
export function IconSun({ size = 16 }) { return <LucideSun size={size} />; }
export function IconUserPlus({ size = 16 }) { return <LucideUserPlus size={size} />; }
export function IconCheck({ size = 16 }) { return <LucideCheck size={size} />; }
export function IconLocation({ size = 16 }) { return <LucideMapPin size={size} />; }
export function IconShield({ size = 16 }) { return <LucideShield size={size} />; }
export function IconBan({ size = 16 }) { return <LucideBan size={size} />; }
export function IconCheckCircle({ size = 16 }) { return <LucideCheckCircle size={size} />; }
export function IconCpu({ size = 16 }) { return <LucideCpu size={size} />; }
export function IconDownload({ size = 16 }) { return <LucideDownload size={size} />; }
export function IconTrash({ size = 16 }) { return <LucideTrash2 size={size} />; }
export function IconInfo({ size = 16, className }) { return <LucideInfo size={size} className={className} />; }
export function IconBird({ size = 16 }) { return <LucideBird size={size} />; }

export function IconVulture({ size = 16, className }) { return <GiVulture size={size} className={className} />; }
export function IconOwl({ size = 16, className }) { return <GiOwl size={size} className={className} />; }
export function IconCrow({ size = 16, className }) { return <GiCrowDive size={size} className={className} />; }
export function IconHen({ size = 16, className }) { return <GiRooster size={size} className={className} />; }
export function IconPeacock({ size = 16, className }) { return <GiFeather size={size} className={className} />; }
export function IconSearch({ size = 16, className }) { return <LucideSearch size={size} className={className} />; }


