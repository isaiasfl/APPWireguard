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
fn connect_vpn() -> Result<String, String> {
    let output = Command::new("pkexec")
        .arg("wg-quick")
        .arg("up")
        .arg("wg0-dpto")
        .output()
        .map_err(|e| format!("Error al ejecutar: {}", e))?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[command]
fn disconnect_vpn() -> Result<String, String> {
    let output = Command::new("pkexec")
        .arg("wg-quick")
        .arg("down")
        .arg("wg0-dpto")
        .output()
        .map_err(|e| format!("Error al ejecutar: {}", e))?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[command]
fn read_wg_config() -> Result<String, String> {
    let path = "/etc/wireguard/wg0-dpto.conf";
    let debug_path = "/tmp/wg0-dpto.conf";
    
    // Primero intentar leer el archivo real
    if let Ok(content) = fs::read_to_string(path) {
        return Ok(content);
    }
    
    // Si no existe, intentar el archivo debug
    if let Ok(content) = fs::read_to_string(debug_path) {
        return Ok(content);
    }
    
    // Si no existe ninguno, devolver cadena vacía
    Ok(String::from(""))
}

#[command]
fn save_wg_config(content: String) -> Result<String, String> {
    println!("🐛 DEBUG: save_wg_config llamado con contenido: {}", content);
    
    // Comentar automáticamente la línea DNS para evitar errores
    let modified_content = content.replace("DNS =", "#DNS =");
    
    let target_file = "/etc/wireguard/wg0-dpto.conf";
    let debug_file = "/tmp/wg0-dpto.conf";
    let temp_file = "/tmp/wg0-dpto-temp.conf";
    
    // Primero escribir al archivo debug como backup
    let _ = fs::write(debug_file, &modified_content);
    
    // Escribir a archivo temporal
    match fs::write(temp_file, &modified_content) {
        Ok(_) => {
            println!("🐛 DEBUG: Archivo temporal escrito");
            
            // Usar sudo para mover el archivo
            let output = Command::new("pkexec")
                .arg("cp")
                .arg(temp_file)
                .arg(target_file)
                .output();
            
            // Limpiar archivo temporal
            let _ = fs::remove_file(temp_file);
            
            match output {
                Ok(result) => {
                    if result.status.success() {
                        println!("🐛 DEBUG: Archivo copiado correctamente a {}", target_file);
                        Ok(format!("✅ Configuración guardada en {}", target_file))
                    } else {
                        let error = String::from_utf8_lossy(&result.stderr);
                        println!("🐛 DEBUG: Error con pkexec: {}", error);
                        // Si falla, al menos tenemos el archivo en /tmp
                        Ok(format!("⚠️ Configuración guardada en {} (no se pudo escribir en {})", debug_file, target_file))
                    }
                },
                Err(e) => {
                    println!("🐛 DEBUG: Error ejecutando pkexec: {}", e);
                    // Si falla, al menos tenemos el archivo en /tmp
                    Ok(format!("⚠️ Configuración guardada en {} (no se pudo ejecutar pkexec)", debug_file))
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
    let config = read_wg_config()?;
    
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
fn check_vpn_status() -> Result<bool, String> {
    let output = Command::new("wg")
        .arg("show")
        .arg("wg0-dpto")
        .output()
        .map_err(|e| format!("Error al ejecutar wg show: {}", e))?;

    // Si el comando tiene éxito y hay salida, la interfaz está activa
    Ok(output.status.success() && !output.stdout.is_empty())
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
            check_vpn_status
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
