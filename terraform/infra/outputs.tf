output "vm_public_ip" {
  description = "Public IP of the ClawdHost VM"
  value       = oci_core_instance.clawdhost_vm.public_ip
}

output "vm_private_ip" {
  description = "Private IP of the ClawdHost VM"
  value       = oci_core_instance.clawdhost_vm.private_ip
}

output "ssh_command" {
  description = "SSH command to connect to the VM"
  value       = "ssh ubuntu@${oci_core_instance.clawdhost_vm.public_ip}"
}
