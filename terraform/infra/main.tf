terraform {
  required_providers {
    oci = {
      source  = "oracle/oci"
      version = "~> 5.0"
    }
  }
}

provider "oci" {
  tenancy_ocid     = var.tenancy_ocid
  user_ocid        = var.user_ocid
  fingerprint      = var.fingerprint
  private_key_path = var.private_key_path
  region           = var.region
}

# Get availability domain
data "oci_identity_availability_domains" "ads" {
  compartment_id = var.tenancy_ocid
}

# VCN (Virtual Cloud Network)
resource "oci_core_vcn" "clawdhost_vcn" {
  compartment_id = var.tenancy_ocid
  display_name   = "clawdhost-vcn"
  cidr_blocks    = ["10.0.0.0/16"]
  dns_label      = "clawdhost"
}

# Internet Gateway
resource "oci_core_internet_gateway" "clawdhost_igw" {
  compartment_id = var.tenancy_ocid
  vcn_id         = oci_core_vcn.clawdhost_vcn.id
  display_name   = "clawdhost-igw"
  enabled        = true
}

# Route Table
resource "oci_core_route_table" "clawdhost_rt" {
  compartment_id = var.tenancy_ocid
  vcn_id         = oci_core_vcn.clawdhost_vcn.id
  display_name   = "clawdhost-rt"

  route_rules {
    network_entity_id = oci_core_internet_gateway.clawdhost_igw.id
    destination       = "0.0.0.0/0"
    destination_type  = "CIDR_BLOCK"
  }
}

# Security List
resource "oci_core_security_list" "clawdhost_sl" {
  compartment_id = var.tenancy_ocid
  vcn_id         = oci_core_vcn.clawdhost_vcn.id
  display_name   = "clawdhost-sl"

  # Allow SSH
  ingress_security_rules {
    protocol    = "6" # TCP
    source      = "0.0.0.0/0"
    source_type = "CIDR_BLOCK"
    tcp_options {
      min = 22
      max = 22
    }
  }

  # Allow HTTP
  ingress_security_rules {
    protocol    = "6"
    source      = "0.0.0.0/0"
    source_type = "CIDR_BLOCK"
    tcp_options {
      min = 80
      max = 80
    }
  }

  # Allow HTTPS
  ingress_security_rules {
    protocol    = "6"
    source      = "0.0.0.0/0"
    source_type = "CIDR_BLOCK"
    tcp_options {
      min = 443
      max = 443
    }
  }

  # Allow backend API port
  ingress_security_rules {
    protocol    = "6"
    source      = "0.0.0.0/0"
    source_type = "CIDR_BLOCK"
    tcp_options {
      min = 3001
      max = 3001
    }
  }

  # Allow all egress
  egress_security_rules {
    protocol         = "all"
    destination      = "0.0.0.0/0"
    destination_type = "CIDR_BLOCK"
  }
}

# Subnet
resource "oci_core_subnet" "clawdhost_subnet" {
  compartment_id    = var.tenancy_ocid
  vcn_id            = oci_core_vcn.clawdhost_vcn.id
  display_name      = "clawdhost-subnet"
  cidr_block        = "10.0.1.0/24"
  route_table_id    = oci_core_route_table.clawdhost_rt.id
  security_list_ids = [oci_core_security_list.clawdhost_sl.id]
  dns_label         = "clawdhostsub"
}

# Get ARM image (Ubuntu 24.04)
data "oci_core_images" "ubuntu_arm" {
  compartment_id           = var.tenancy_ocid
  operating_system         = "Canonical Ubuntu"
  operating_system_version = "24.04"
  shape                    = "VM.Standard.A1.Flex"
  sort_by                  = "TIMECREATED"
  sort_order               = "DESC"
}

# Compute Instance (ARM - Always Free)
resource "oci_core_instance" "clawdhost_vm" {
  compartment_id      = var.tenancy_ocid
  availability_domain = data.oci_identity_availability_domains.ads.availability_domains[0].name
  display_name        = "clawdhost-vm"
  shape               = "VM.Standard.A1.Flex"

  shape_config {
    ocpus         = 4  # Max for always free
    memory_in_gbs = 24 # Max for always free
  }

  source_details {
    source_type = "image"
    source_id   = data.oci_core_images.ubuntu_arm.images[0].id
  }

  create_vnic_details {
    subnet_id        = oci_core_subnet.clawdhost_subnet.id
    assign_public_ip = true
  }

  metadata = {
    ssh_authorized_keys = var.ssh_public_key
    user_data           = base64encode(file("${path.module}/cloud-init.yaml"))
  }
}
