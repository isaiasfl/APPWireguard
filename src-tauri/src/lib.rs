use std::process::{Command, Stdio};
use std::io::Write;
use std::fs;
use tauri::command;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
struct GithubProfile {
    login: String,
    name: Option<String>,
    avatar_url: String,
    html_url: String,
}

#[command]
fn connect_vpn(vpn_name: Option<String>) -> Result<String, String> {
    let interface_name = format!("wg0-{}", vpn_name.unwrap_or_else(|| "dpto".to_string()));
    let output = Command::new("sudo")
        .arg("wg-quick")
        .arg("up")
        .arg(&interface_name)
        .output()
        .map_err(|e| format!("Error al ejecutar: {}", e))?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[command]
fn disconnect_vpn(vpn_name: Option<String>) -> Result<String, String> {
    let interface_name = format!("wg0-{}", vpn_name.unwrap_or_else(|| "dpto".to_string()));
    let output = Command::new("sudo")
        .arg("wg-quick")
        .arg("down")
        .arg(&interface_name)
        .output()
        .map_err(|e| format!("Error al ejecutar: {}", e))?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[command]
fn read_wg_config(vpn_name: Option<String>) -> Result<String, String> {
    let interface_name = format!("wg0-{}", vpn_name.unwrap_or_else(|| "dpto".to_string()));
    let path = format!("/etc/wireguard/{}.conf", interface_name);
    let debug_path = format!("/tmp/{}.conf", interface_name);
    
    // Primero intentar leer el archivo real
    if let Ok(content) = fs::read_to_string(&path) {
        return Ok(content);
    }
    
    // Si no existe, intentar el archivo debug
    if let Ok(content) = fs::read_to_string(&debug_path) {
        return Ok(content);
    }
    
    // Si no existe ninguno, devolver cadena vacía
    Ok(String::from(""))
}

#[command]
fn save_wg_config(content: String, vpn_name: Option<String>) -> Result<String, String> {
    println!("🐛 DEBUG: save_wg_config llamado con contenido: {}", content);
    
    // Comentar automáticamente la línea DNS para evitar errores
    let modified_content = content.replace("DNS =", "#DNS =");
    
    let interface_name = format!("wg0-{}", vpn_name.unwrap_or_else(|| "dpto".to_string()));
    let target_file = format!("/etc/wireguard/{}.conf", interface_name);
    let debug_file = format!("/tmp/{}.conf", interface_name);
    let temp_file = format!("/tmp/{}-temp.conf", interface_name);
    
    // Primero escribir al archivo debug como backup
    let _ = fs::write(&debug_file, &modified_content);
    
    // Escribir a archivo temporal
    match fs::write(&temp_file, &modified_content) {
        Ok(_) => {
            println!("🐛 DEBUG: Archivo temporal escrito");
            
            // Usar sudo para mover el archivo
            let output = Command::new("sudo")
                .arg("cp")
                .arg(&temp_file)
                .arg(&target_file)
                .output();
            
            // Limpiar archivo temporal
            let _ = fs::remove_file(&temp_file);
            
            match output {
                Ok(result) => {
                    if result.status.success() {
                        println!("🐛 DEBUG: Archivo copiado correctamente a {}", &target_file);
                        Ok(format!("✅ Configuración guardada en {}", &target_file))
                    } else {
                        let error = String::from_utf8_lossy(&result.stderr);
                        println!("🐛 DEBUG: Error con sudo: {}", error);
                        // Si falla, al menos tenemos el archivo en /tmp
                        Ok(format!("⚠️ Configuración guardada en {} (no se pudo escribir en {})", &debug_file, &target_file))
                    }
                },
                Err(e) => {
                    println!("🐛 DEBUG: Error ejecutando sudo: {}", e);
                    // Si falla, al menos tenemos el archivo en /tmp
                    Ok(format!("⚠️ Configuración guardada en {} (no se pudo ejecutar sudo)", &debug_file))
                }
            }
        },
        Err(e) => {
            println!("🐛 DEBUG: Error escribiendo archivo temporal: {}", e);
            Err(format!("Error escribiendo archivo temporal: {}", e))
        }
    }
}

#[command]
fn check_wireguard_installed() -> bool {
    Command::new("which")
        .arg("wg")
        .output()
        .map(|o| o.status.success())
        .unwrap_or(false)
}

#[command]
fn generate_keys() -> Result<(String, String), String> {
    let home_dir = std::env::var("HOME").unwrap_or_else(|_| "/home/user".to_string());
    let wg_dir = format!("{}/.wireguard", home_dir);
    let private_path = format!("{}/privatekey", wg_dir);
    let public_path = format!("{}/publickey", wg_dir);
    
    // Verificar si ya existen las claves
    if let (Ok(private_key), Ok(public_key)) = (fs::read_to_string(&private_path), fs::read_to_string(&public_path)) {
        return Ok((private_key.trim().to_string(), public_key.trim().to_string()));
    }
    
    // Si no existen, generarlas
    let private_output = Command::new("wg")
        .arg("genkey")
        .output()
        .map_err(|e| e.to_string())?;

    let private_key = String::from_utf8_lossy(&private_output.stdout).trim().to_string();

    let mut child = Command::new("wg")
        .arg("pubkey")
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .spawn()
        .map_err(|e| e.to_string())?;

    {
        let stdin = child.stdin.as_mut().ok_or("Error accediendo al stdin")?;
        stdin.write_all(private_key.as_bytes()).map_err(|e| e.to_string())?;
    }

    let output = child.wait_with_output().map_err(|e| e.to_string())?;
    let public_key = String::from_utf8_lossy(&output.stdout).trim().to_string();

    // Crear directorio si no existe
    if let Err(_) = fs::create_dir_all(&wg_dir) {
        return Ok((private_key, public_key)); // Si no puede crear, devolver las claves sin guardar
    }
    
    // Guardar las claves
    let _ = fs::write(&private_path, &private_key);
    let _ = fs::write(&public_path, &public_key);

    Ok((private_key, public_key))
}

#[command]
fn get_username() -> String {
    std::env::var("USER").unwrap_or_else(|_| "Desconocido".into())
}

#[command]
fn get_hostname() -> String {
    Command::new("hostname")
        .output()
        .map(|output| String::from_utf8_lossy(&output.stdout).trim().to_string())
        .unwrap_or_else(|_| "Desconocido".to_string())
}

#[command]
fn get_ip_address() -> String {
    Command::new("sh")
        .arg("-c")
        .arg("ip route get 1.1.1.1 | awk '{print $7}'")
        .output()
        .map(|output| String::from_utf8_lossy(&output.stdout).trim().to_string())
        .unwrap_or_else(|_| "Desconocida".to_string())
}

#[command]
fn get_os_info() -> String {
    Command::new("sh")
        .arg("-c")
        .arg("grep PRETTY_NAME /etc/os-release | cut -d= -f2")
        .output()
        .map(|output| {
            String::from_utf8_lossy(&output.stdout)
                .replace('"', "")
                .trim()
                .to_string()
        })
        .unwrap_or_else(|_| "Desconocido".to_string())
}

#[command]
fn get_dns_servers() -> String {
    match Command::new("systemd-resolve")
        .arg("--status")
        .output()
    {
        Ok(output) => {
            let stdout = String::from_utf8_lossy(&output.stdout);
            let mut dns_lines = vec![];

            for line in stdout.lines() {
                if line.trim_start().starts_with("DNS Servers:") {
                    dns_lines.push(line.trim().replace("DNS Servers:", "").trim().to_string());
                }
            }

            dns_lines.join(", ")
        },
        Err(_) => "No disponible".to_string()
    }
}

#[command]
async fn get_github_info() -> Result<GithubProfile, String> {
    let url = "https://api.github.com/users/isaiasfl";
    let client = reqwest::Client::new();

    let res = client
        .get(url)
        .header("User-Agent", "tauri-app")
        .send()
        .await
        .map_err(|e| e.to_string())?;

    res.json::<GithubProfile>()
        .await
        .map_err(|e| e.to_string())
}

#[command]
fn check_config_complete() -> Result<bool, String> {
    let config = read_wg_config(None)?;
    
    if config.trim().is_empty() {
        return Ok(false);
    }
    
    // Verificar que tenga los campos obligatorios con valores reales
    let lines: Vec<&str> = config.lines().collect();
    
    let has_private_key = lines.iter().any(|line| {
        line.trim().starts_with("PrivateKey =") && 
        line.trim().len() > "PrivateKey =".len() + 1
    });
    
    let has_public_key = lines.iter().any(|line| {
        line.trim().starts_with("PublicKey =") && 
        line.trim().len() > "PublicKey =".len() + 1 &&
        !line.contains("SERVIDOR_PUBLIC_KEY_AQUI")
    });
    
    let has_endpoint = lines.iter().any(|line| {
        line.trim().starts_with("Endpoint =") && 
        line.trim().len() > "Endpoint =".len() + 1 &&
        !line.contains("x.x.x.x:51820")
    });
    
    Ok(has_private_key && has_public_key && has_endpoint)
}

#[command]
fn check_vpn_status(vpn_name: Option<String>) -> Result<bool, String> {
    let interface_name = format!("wg0-{}", vpn_name.unwrap_or_else(|| "dpto".to_string()));
    
    // Método 1: Verificar con ip addr
    let output = Command::new("ip")
        .arg("addr")
        .arg("show")
        .arg(&interface_name)
        .output()
        .map_err(|e| format!("Error al ejecutar ip addr: {}", e))?;

    if output.status.success() {
        let stdout = String::from_utf8_lossy(&output.stdout);
        // Si hay contenido y contiene "inet", la interfaz está UP con IP
        return Ok(!stdout.is_empty() && stdout.contains("inet"));
    }

    // Método 2: Fallback con wg show
    let wg_output = Command::new("wg")
        .arg("show")
        .arg(&interface_name)
        .output();
        
    if let Ok(wg_result) = wg_output {
        return Ok(wg_result.status.success() && !wg_result.stdout.is_empty());
    }

    Ok(false)
}

#[command]
fn find_active_vpn() -> Result<Option<String>, String> {
    // Buscar cualquier interfaz wg0-* activa
    let output = Command::new("wg")
        .arg("show")
        .output()
        .map_err(|e| format!("Error al ejecutar wg show: {}", e))?;

    if output.status.success() {
        let stdout = String::from_utf8_lossy(&output.stdout);
        
        // Buscar líneas que empiecen con "interface: wg0-"
        for line in stdout.lines() {
            if line.starts_with("interface: wg0-") {
                // Extraer el nombre (ej: "interface: wg0-dpto" -> "dpto")
                if let Some(full_interface) = line.strip_prefix("interface: ") {
                    if let Some(name_part) = full_interface.strip_prefix("wg0-") {
                        return Ok(Some(name_part.to_string()));
                    }
                }
            }
        }
    }

    Ok(None)
}

#[command]
fn list_available_vpns() -> Result<Vec<String>, String> {
    let mut vpn_names = Vec::new();
    
    // Usar sudo ls para listar archivos en /etc/wireguard/
    let output = Command::new("sudo")
        .arg("ls")
        .arg("/etc/wireguard/")
        .output()
        .map_err(|e| format!("Error ejecutando sudo ls: {}", e))?;

    if output.status.success() {
        let stdout = String::from_utf8_lossy(&output.stdout);
        println!("🐛 DEBUG: Archivos en /etc/wireguard/: {}", stdout);
        
        for line in stdout.lines() {
            let file_name = line.trim();
            if file_name.starts_with("wg0-") && file_name.ends_with(".conf") {
                // Extraer el nombre (ej: "wg0-dpto.conf" -> "dpto")
                let name = file_name
                    .strip_prefix("wg0-")
                    .unwrap()
                    .strip_suffix(".conf")
                    .unwrap();
                println!("🐛 DEBUG: VPN encontrada: {}", name);
                vpn_names.push(name.to_string());
            }
        }
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        println!("🐛 DEBUG: Error con sudo ls: {}", stderr);
        return Err(format!("Error listando /etc/wireguard/: {}", stderr));
    }
    
    println!("🐛 DEBUG: VPNs totales encontradas: {:?}", vpn_names);
    
    // Ordenar alfabéticamente
    vpn_names.sort();
    Ok(vpn_names)
}

#[command]
fn get_vpn_ip() -> String {
    Command::new("ip")
        .arg("addr")
        .arg("show")
        .arg("wg0-dpto")
        .output()
        .map(|output| {
            if output.status.success() {
                let stdout = String::from_utf8_lossy(&output.stdout);
                // Buscar línea con "inet"
                for line in stdout.lines() {
                    if line.trim().starts_with("inet ") && !line.contains("127.0.0.1") {
                        // Extraer la IP (formato: "inet 192.168.100.105/32 scope global wg0-dpto")
                        if let Some(ip_part) = line.trim().split_whitespace().nth(1) {
                            return ip_part.split('/').next().unwrap_or("N/A").to_string();
                        }
                    }
                }
            }
            "No conectado".to_string()
        })
        .unwrap_or_else(|_| "Error".to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            connect_vpn,
            disconnect_vpn,
            read_wg_config,
            save_wg_config,
            check_wireguard_installed,
            generate_keys,
            get_username,
            get_hostname,
            get_ip_address,
            get_os_info,
            get_dns_servers,
            get_github_info,
            check_config_complete,
            check_vpn_status,
            find_active_vpn,
            list_available_vpns,
            get_vpn_ip
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
